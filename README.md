# Villads Claes — personlig hjemmeside

Ren HTML, CSS og JavaScript uden build-trin og uden afhængigheder. Siden ligger på mit eget webhotel og bliver opdateret automatisk fra GitHub.

## Sådan hænger det sammen

```
 Din computer           GitHub                 Webhotellet
 ────────────   push    ──────────   FTP       ────────────
 Du retter  ───────────▶ Gemmer  ────────────▶ Siden vises
 filerne                 historik  (automatisk) for verden
```

1. **Din computer:** Her retter du filerne.
2. **GitHub:** Gemmer alle versioner (så du altid kan fortryde) og kører automatikken.
3. **Webhotellet:** Viser siden for besøgende. GitHub kopierer de ændrede filer hertil via FTP, hver gang du pusher.

Automatikken står i `.github/workflows/udgiv.yml`. Du kan følge med i fanen **Actions** på GitHub: grøn ✓ betyder, at siden er opdateret, og rødt ✗ betyder, at noget gik galt (klik på det for at se hvad).

## Struktur

```
index.html      Forside: om mig, værdier, drømme, personaer, familie, kontakt
cv.html         CV (kan gemmes som PDF via knappen eller Ctrl+P)
legeplads.html  122 interaktive UI- og CSS/JS-eksperimenter, porteret fra CodePen-idéer
css/style.css   Al styling. Farverne ligger som variabler øverst i filen
js/main.js      Hilsen efter tidspunkt, lyst/mørkt tema, menu, scroll-animation og musik
js/legeplads.js Interaktioner til legepladsens 122 små demoer
api/lastfm.ashx Henter mine seneste numre fra Last.fm (ASP.NET, kører på webhotellet)
img/            Læg dine billeder her
```

## Opsætning (skal kun gøres én gang)

### 1. Find dine FTP-oplysninger hos webhotellet

Log ind i webhotellets kontrolpanel, og find siden om **FTP**. Notér:

| Hvad | Eksempel | Bruges som |
|---|---|---|
| FTP-server (host) | `linux123.unoeuro-server.com` eller `ftp.villadsclaes.dk` | `FTP_SERVER` |
| Brugernavn | `villadsclaes.dk` | `FTP_BRUGER` |
| Adgangskode | (din FTP-adgangskode) | `FTP_ADGANGSKODE` |
| Mappen siden skal ligge i | `public_html/` | `FTP_MAPPE` |

Mappen skal slutte med `/`. På Simply.com får et underdomæne sin egen mappe i roden af FTP-login. `mig.villadsclaes.dk` bruger derfor mappen `mig/`, og det er den, der står i `FTP_MAPPE`.

### 2. Gem oplysningerne som "secrets" på GitHub

Secrets er krypterede: Ingen kan læse dem igen, heller ikke dig, og de står aldrig i koden.

1. Åbn repoet på github.com → **Settings** → **Secrets and variables** → **Actions**.
2. Klik **New repository secret** fire gange og opret `FTP_SERVER`, `FTP_BRUGER`, `FTP_ADGANGSKODE` og `FTP_MAPPE`. Navnene skal staves præcis sådan.

### 3. Last.fm (musikken på forsiden)

Sektionen "Det lytter jeg til" viser, hvad du lytter til lige nu. Den kræver en gratis API-nøgle fra Last.fm.

1. Gå til [last.fm/api/account/create](https://www.last.fm/api/account/create), og log ind med din Last.fm-konto.
2. Udfyld navn (f.eks. `mig.villadsclaes.dk`) og en kort beskrivelse. Resten kan stå tomt.
3. Kopiér **API key** (32 tegn). Du skal ikke bruge "Shared secret".
4. Opret den som repository secret med navnet `LASTFM_API_KEY`, ligesom FTP-oplysningerne.

Nøglen bliver kun lagt på webhotellet, aldrig i koden. Brugernavnet står øverst i `api/lastfm.ashx`. Mangler nøglen, bliver musik-sektionen bare ikke vist. Lokalt med `python -m http.server` bliver eksempeldata fra `api/lastfm-eksempel.json` vist, fordi Python-serveren ikke kan køre ASP.NET.

### 4. Første udgivelse

Gå til fanen **Actions** → **Udgiv til webhotel** → **Run workflow**. Efter et minut er siden live.

## Hverdagen: ret og udgiv

1. Ret filerne (søg efter `✏️` i `index.html` og `cv.html`. Alt i `[firkantede parenteser]` er pladsholdere).
2. Se resultatet lokalt: `python -m http.server 5173`, og åbn http://localhost:5173.
3. Gem og send til GitHub. I VS Code kan du bruge Source Control-fanen (skriv en besked → **Commit** → **Sync**). Fra en terminal:

   ```bash
   git add -A
   git commit -m "Beskriv hvad du har ændret"
   git push
   ```

4. Vent et minut. Så er siden opdateret.

## Fejlfinding

- **Rødt ✗ i Actions med "timeout" eller "TLS":** Webhotellet understøtter måske ikke krypteret FTP. Ret `protocol: ftps` til `protocol: ftp` i `.github/workflows/udgiv.yml`.
- **"Login incorrect":** Ret `FTP_BRUGER` eller `FTP_ADGANGSKODE` under Settings → Secrets.
- **Musik-sektionen vises ikke:** Åbn `https://mig.villadsclaes.dk/api/lastfm.ashx` i browseren. Står der "API-nøglen mangler", er secret'en `LASTFM_API_KEY` ikke sat (kør udgivelsen igen bagefter). Står der en fejl fra Last.fm, så tjek at nøglen er kopieret rigtigt.
- **Siden viser ikke ændringerne:** Tryk Ctrl+F5 i browseren for at hente den nyeste version.
