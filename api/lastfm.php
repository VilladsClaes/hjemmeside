<?php
// Henter mine seneste scrobbles fra Last.fm og sender en kort, ren JSON-version videre til forsiden.
// API-nøglen ligger i lastfm-noegle.php, som GitHub Actions skriver ud fra secret'en LASTFM_API_KEY,
// så den aldrig står i koden eller bliver vist for besøgende.
// Svaret gemmes i 20 sekunder, så Last.fm ikke bliver kaldt for hver eneste besøgende.

const BRUGER = 'villadsclaes';
const ANTAL = 8;
const CACHE_SEKUNDER = 20;
// Last.fm bruger dette billede, når et album ikke har et omslag. Så viser vi hellere vores eget.
const TOMT_OMSLAG = '2a96cbd8b46e442fc41c2b86b821562f';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');
header('X-Content-Type-Options: nosniff');

function svar($json, $status = 200) {
  http_response_code($status);
  echo $json;
  exit;
}

$cacheFil = __DIR__ . '/.lastfm-cache.json';
$cache = is_file($cacheFil) ? file_get_contents($cacheFil) : false;
if ($cache !== false && time() - filemtime($cacheFil) < CACHE_SEKUNDER) svar($cache);

// Hvis Last.fm driller, viser vi hellere lidt gamle data end ingenting
function fejl($besked) {
  global $cache;
  if ($cache !== false) svar($cache);
  svar(json_encode(['fejl' => $besked]), 502);
}

$noegleFil = __DIR__ . '/lastfm-noegle.php';
$noegle = is_file($noegleFil) ? include $noegleFil : '';
if (!is_string($noegle) || $noegle === '') svar('{"fejl":"API-nøglen mangler"}', 500);

$url = 'https://ws.audioscrobbler.com/2.0/?' . http_build_query([
  'method' => 'user.getrecenttracks',
  'user' => BRUGER,
  'limit' => ANTAL,
  'api_key' => $noegle,
  'format' => 'json',
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CONNECTTIMEOUT => 4,
  CURLOPT_TIMEOUT => 6,
  CURLOPT_USERAGENT => 'mig.villadsclaes.dk',
]);
$raa = curl_exec($ch);
curl_close($ch);

$data = $raa ? json_decode($raa, true) : null;
$spor = $data['recenttracks']['track'] ?? null;
if (!is_array($spor)) fejl('Kunne ikke hente fra Last.fm');
if (isset($spor['name'])) $spor = [$spor]; // ét enkelt nummer kommer ikke som liste

$ud = [];
foreach (array_slice($spor, 0, ANTAL) as $t) {
  // Billederne kommer fra lille til stor. Tag det største, der findes
  $billede = '';
  foreach ($t['image'] ?? [] as $b) {
    if (!empty($b['#text'])) $billede = $b['#text'];
  }
  if (strpos($billede, TOMT_OMSLAG) !== false) $billede = '';

  $ud[] = [
    'titel' => $t['name'] ?? '',
    'kunstner' => $t['artist']['#text'] ?? '',
    'album' => $t['album']['#text'] ?? '',
    'billede' => $billede,
    'url' => $t['url'] ?? '',
    'nu' => isset($t['@attr']['nowplaying']),
    'tid' => (int) ($t['date']['uts'] ?? 0),
  ];
}

$json = json_encode(['bruger' => BRUGER, 'spor' => $ud], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
file_put_contents($cacheFil, $json, LOCK_EX);
svar($json);
