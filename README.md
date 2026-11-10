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
index.html      Forside: om mig, projekter, interaktive værksteder, drømme, familie, kontakt
cv.html         CV (kan gemmes som PDF via knappen eller Ctrl+P)
legeplads.html  122 interaktive UI- og CSS/JS-eksperimenter, porteret fra CodePen-idéer
nedtaelling.html  Opret og del en nedtælling til en rigtig dato — alt data ligger i selve linket, ingen server
invitation.html Opret og del en kalenderinvitation — hent en rigtig .ics-fil, alt data ligger i selve linket
stavning.html   Stav et navn/ord med det danske stavealfabet og del et link — modtageren ser/hører samme stavning
avatar.html     Byg en lille avatar og hent den som et rigtigt PNG-billede (canvas → toBlob())
citat.html      Skriv et citat, vælg et tema, og hent det som et delbart PNG-billede (canvas → toBlob())
replik.html     Skriv en replik i en talebobbel, og del den med et rigtigt link — alt data ligger i selve linket
css/style.css   Al styling. Farverne ligger som variabler øverst i filen
js/main.js      Hilsen, tema, menu, scroll-animation, interaktive værksteder og musik
js/legeplads.js Interaktioner til legepladsens små UI-demoer
js/legeplads-levende.js  Legepladsens demoer med rigtigt indhold (data, live-kilder og den delte citatmaskine)
js/nedtaelling.js  Koder/afkoder nedtællingens data til og fra URL'ens hash-fragment (base64url)
js/invitation.js  Koder/afkoder invitationens data (base64url) og genererer .ics-kalenderfiler
js/stavning.js  Koder/afkoder det stavede ord til og fra URL'ens hash-fragment (base64url) og læser det op
js/citat.js     Tegner citat-kortet på canvas (ordombrydning, skriftstørrelse-tilpasning) og eksporterer som PNG
js/replik.js    Koder/afkoder replikkens bobleform og tekst til og fra URL'ens hash-fragment (base64url)
js/live-afstand.js  Besøgendes samtykke-flow for at se "live afstand til mig" (forsidens #live-afstand-sektion)
data/           Indholdet bag legepladsen: projekter, CV, ordnet, undervisning og FAQ
api/lastfm.ashx Henter mine seneste numre fra Last.fm (med ?vis=top: månedens kunstnere)
img/            Læg dine billeder her
```

Forsiden rummer også web-eksperimenter med CSS, SVG, Canvas og WebGL. Animationerne respekterer reduceret bevægelse, og canvas-effekterne sættes på pause, når de ikke er synlige.

Idébogen på legepladsen (`legeplads.html#skitsejournal`) er en rigtig, personlig
funktion: du kan skrive dine egne idéer, markere og slette dem. Det gemmes kun
lokalt i din browser (`localStorage`, nøglen `legeplads-skitsejournal`) — ingen
konto, ingen server, og det følger derfor ikke med til en anden enhed. Første
besøg vises tre eksempel-idéer; så snart du selv ændrer noget, er det dine
egne data.

### Ret indholdet på legepladsen

Mange af legepladsens demoer viser rigtigt indhold, som ligger i `data/`. Ret dér, så følger alle demoerne med:

| Fil | Indhold | Bruges af |
|---|---|---|
| `data/projekter.js` | Mine projekter | Søgning, atelier, mosaik, galleri, vendekort |
| `data/cv.js` | Forløb, kompetenceområder, værktøjer, sprog, værdier | Tidslinje, trin, medaljer, periodisk system, værdier |
| `data/ordnet.js` | Begreber med over-/underbegreber, dele og associationer | Semantisk netværk, ordkort, ordbog |
| `data/undervisning.js` | Huskespilsæt, exit ticket, timer, materialer, stavealfabet | Værktøjerne til klassen |
| `data/faq.js` | Spørgsmål og svar om mig og mine projekter | Billetkort (FAQ) |

`cv.html` og forsiden er stadig skrevet i ren HTML (så de kan printes og læses uden JavaScript), så husk at rette dem også.

Live-demoerne henter selv data: Last.fm (via `api/lastfm.ashx`), vejret i Højbjerg fra Open-Meteo og min offentlige aktivitet fra GitHub. Ingen af dem kræver nøgler i browseren. Alle 122 eksperimenter kan også vurderes af besøgende (1-5) — en rigtig, delt funktion i Firebase, se afsnittet om den delte opgaveliste nedenfor. Citatmaskinen (eksperiment #92) er på samme måde en rigtig, delt funktion: besøgende kan indsende egne citater, se afsnittet "Bonus: delt citatmaskine" nedenfor. Forsiden har også en "live afstand"-sektion (`#live-afstand`), der — med besøgendes samtykke — viser hvor langt væk Villads er lige nu, baseret på hans live GPS-position; se afsnittet "Bonus: live afstand til besøgende" nedenfor.

## Opsætning af den delte opgaveliste (Firebase + Microsoft To Do)

Opgavelisten (`opgaveliste.html` / `opgaveliste-admin.html`) er en selvstændig
funktion oven på den statiske hjemmeside. Den statiske del uploades stadig via
FTP som hele resten af siden, men selve databasen og synkroniseringen med
Microsoft To Do kører i et separat **Firebase**-projekt (Firestore + Cloud
Functions), fordi webhotellet ikke kan køre server-kode.

### Hvordan det hænger sammen

```
Besøgende  ──▶  opgaveliste.html  ──▶  Firestore (Firebase)  ──▶  Cloud Functions  ──▶  Microsoft Graph (To Do)
                                              ▲                         │
                                              └─────── planlagt pull ───┘  (hvert 15. min)
```

- Besøgende kan se godkendte opgaver, foreslå nye, og "tage" ubemandede opgaver.
  Alt det nye går i en godkendelseskø (`pendingSubmissions` / `pendingClaims`).
- Du godkender/afviser på `opgaveliste-admin.html` (kræver login med din
  Google-konto — kun den e-mail, du sætter som `OWNER_EMAIL`, har adgang).
- Når du godkender, opretter en Cloud Function opgaven i en dedikeret liste
  ("Fra hjemmesiden") i din Microsoft To Do via Microsoft Graph-API'et.
- Hver 15. minut henter en planlagt Cloud Function ændringer fra Microsoft To
  Do (fuldført, omdøbt, slettet) og opdaterer `opgaveliste.html` tilsvarende.
- **Google Tasks** kan bruges som fallback-udbyder (`ACTIVE_PROVIDER=google` i
  `functions/.env`), hvis Microsoft Graph-opsætningen for private Microsoft-
  konti viser sig for besværlig.
- **FocusToDo er ikke understøttet.** De har ingen offentlig API eller
  udvikler-dokumentation, så det er teknisk ikke muligt at integrere med dem.

### Trin 1 — Opret Firebase-projekt

1. Gå til [console.firebase.google.com](https://console.firebase.google.com) → **Tilføj projekt**.
2. Aktivér **Firestore Database** (produktionstilstand) og **Authentication**
   → aktivér **Google** som sign-in-metode.
   → aktivér også **E-mail/adgangskode** som sign-in-metode — den bruges af
     den rigtige konto-oprettelse på `opgaveliste.html` (besøgende kan
     oprette en konto og følge status på egne forslag/anmodninger).
3. Opgrader til **Blaze-planen** (betal-efter-forbrug) — det er et krav for at
   bruge Cloud Functions, men for en lille opgaveliste koster det reelt intet
   eller meget lidt om måneden.
4. Under **Projektindstillinger → Dine apps**, opret en **Web-app** og kopiér
   konfigurationsobjektet ind i `js/firebase-config.js`.
5. Log ind én gang på `opgaveliste-admin.html` med den Google-konto, du vil
   bruge som ejer. Find din **UID** under **Authentication → Users**, og sæt
   den ind i `firestore.rules` i stedet for `OWNER_UID_PLACEHOLDER`.

### Trin 2 — Registrér en Azure AD-app (til Microsoft To Do)

1. Gå til [portal.azure.com](https://portal.azure.com) → **Microsoft Entra ID** → **App-registreringer** → **Ny registrering**.
2. Vælg **Konti i enhver organisationskatalog og private Microsoft-konti**
   (så din private Microsoft-konto kan bruges).
3. Under **Godkendelse**, tilføj en **Web**-redirect-URI, der peger på din
   kommende `msOauthCallback`-funktion, typisk:
   `https://REGION-PROJEKT-ID.cloudfunctions.net/msOauthCallback`
4. Under **Certifikater og hemmeligheder**, opret en ny **client secret** og
   gem den — den skal bruges som Firebase-secret (se nedenfor), ikke i kode.
5. Under **API-tilladelser**, tilføj delegerede Microsoft Graph-tilladelser:
   `Tasks.ReadWrite` og `offline_access`.

### Trin 3 — Konfigurér Cloud Functions

```bash
cd functions
npm install
cp .env.example .env        # udfyld OWNER_EMAIL, MS_CLIENT_ID, MS_REDIRECT_URI m.m.
firebase functions:secrets:set MS_CLIENT_SECRET
firebase functions:secrets:set TOKEN_ENCRYPTION_KEY   # generér med:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
cp ../.firebaserc.example ../.firebaserc   # udfyld dit Firebase-projekt-id
```

### Trin 4 — Deploy

```bash
firebase deploy --only functions,firestore:rules
```

> Har du allerede et Firebase-projekt sat op fra før kontooprettelsen blev
> tilføjet? Så skal du bare: aktivér **E-mail/adgangskode** under
> **Authentication → Sign-in method** (se Trin 1 ovenfor), og kør
> `firebase deploy --only functions,firestore:rules` igen, så de opdaterede
> regler og Cloud Functions (som nu gemmer `uid` på forslag/anmodninger) er i
> drift.

### Trin 5 — Forbind Microsoft To Do

Log ind på `opgaveliste-admin.html` og klik **"Forbind Microsoft To Do"**. Det
åbner Microsofts login i en ny fane; godkend adgangen, og du er klar. (Hvis du
i stedet vælger Google Tasks som fallback, bruges "Forbind Google Tasks"-
knappen, og `ACTIVE_PROVIDER` i `.env` skal sættes til `google`.)

### Bonus: delt vurdering af legepladsens eksperimenter

Samme Firebase-projekt (og samme `js/firebase-config.js`) bruges også til en
rigtig, delt rating-funktion på `legeplads.html`: besøgende kan vurdere hvert
eksperiment fra 1-5, og siden viser live gennemsnit samt en lille "Mest
populære eksperimenter"-oversigt ved filterbaren. Der gemmes kun aggregerede
tal (collection `ratings`, ét dokument pr. eksperiment med antal stemmer og
summen af dem) — ingen individuelle stemmer eller uid'er. Skrivningen sker
direkte fra klienten (intet behov for en Cloud Function), men er valideret af
`firestore.rules`, så en stemme kun kan lægge præcis 1 til antallet og 1-5 til
summen. Hver browser må kun stemme én gang pr. eksperiment (husket lokalt).

Er Firebase allerede sat op til opgavelisten (Trin 1-4 ovenfor), kræver denne
funktion intet ekstra ud over at redeploye de opdaterede regler:

```bash
firebase deploy --only firestore:rules
```

### Bonus: delt citatmaskine

Samme Firebase-projekt bruges også til en rigtig, delt citatmaskine på
`legeplads.html` (eksperiment #92, "En lille maskine til store tanker"):
besøgende kan bladre mellem citater med "← Forrige"/"Næste →", og selv
indsende deres eget citat (plus et valgfrit navn) via et lille skema i
demoen. Til forskel fra vurderingerne er citater rigtig tekst fra besøgende,
så de kræver godkendelse, før de deles med andre — ligesom opgavelistens
forslag:

- Et indsendt citat havner i `pendingQuotes` (kun oprettelse er tilladt fra
  klienten, se `firestore.rules`).
- Du godkender/afviser på `opgaveliste-admin.html` (samme login som
  opgavelisten), under "Ventende citater til citatmaskinen".
- Et godkendt citat flyttes af Cloud Function'en `approveQuote` til den
  offentligt læsbare collection `quotes` (klienten kan kun læse, aldrig
  skrive direkte til den).
- De 4 oprindelige citater fra lanceringen vises altid som "seed"-indhold
  sammen med alle godkendte citater — citatmaskinen virker derfor også, hvis
  Firebase ikke er sat op (den falder blot tilbage til kun at vise de 4).

Er Firebase og Cloud Functions allerede sat op (Trin 1-4 ovenfor), kræver
denne funktion blot en redeploy af både regler og functions:

```bash
firebase deploy --only firestore:rules,functions
```

### Bonus: live afstand til besøgende

Samme Firebase-projekt bruges også til en helt ny, selvstændig funktion på
forsiden: en "live afstand"-sektion (`index.html#live-afstand`), der viser
besøgende hvor langt væk Villads er fra dem lige nu, fx "Jeg er 142 meter fra
dig" eller "Jeg er 3,2 km fra dig".

```
Villads' telefon (OwnTracks)  ──POST──▶  Cloud Function "reportLocation"  ──▶  Firestore "location/current"
                                                                                        │
Besøgendes browser (samtykke)  ──lat/lng──▶  Cloud Function "getDistanceToVisitor" ◀────┘
                                                      │
                                              kun afstanden sendes tilbage
```

**Privatliv er grundlæggende her:** Villads' rå koordinater sendes aldrig til
eller er tilgængelige for browseren/besøgende — hverken i UI'et eller i
netværkstrafikken. Afstanden beregnes udelukkende server-side
(Haversine-formlen) i Cloud Function'en `getDistanceToVisitor`, som kun
returnerer selve afstanden (plus hvor længe siden positionen blev opdateret).
Positionen gemmes i Firestore-collection'en `location`, som
`firestore.rules` eksplicit gør utilgængelig for enhver klient — kun Cloud
Functions (Admin SDK) kan læse/skrive den.

#### Trin 1 — Installér og konfigurér OwnTracks på telefonen

Funktionen er bygget til **OwnTracks** (ikke GPSLogger), fordi det er den
eneste af de to, der understøtter både iOS og Android.

1. Installér OwnTracks: [App Store](https://apps.apple.com/app/owntracks/id692424691)
   (iOS) eller [Google Play](https://play.google.com/store/apps/details?id=org.owntracks.android)
   (Android).
2. Generér en hemmelig token og gem den som Firebase-secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
   firebase functions:secrets:set LOCATION_REPORT_TOKEN
   ```
3. Åbn OwnTracks' indstillinger (⚙) → **Connection**:
   - **Mode**: `HTTP`
   - **Host/URL**: `https://REGION-PROJEKT-ID.cloudfunctions.net/reportLocation?token=DIN_HEMMELIGE_TOKEN`
     (brug din egen Cloud Functions-region og projekt-id, se Firebase-konsollen)
   - **Identification** → **Tracker ID**: valgfrit 2-tegns id, fx `VC` (kræves
     af OwnTracks' HTTP-mode, bruges ikke af hjemmesiden).
4. Under **Advanced**, sæt gerne et rimeligt rapporteringsinterval (fx hvert
   1.-5. minut, eller lad OwnTracks rapportere ved bevægelse) — hyppigere
   opdateringer giver en mere præcis "live"-afstand.
5. Tryk "Send nu" (eller vent på næste automatiske rapport) for at teste at
   positionen bliver gemt.

> Bruger du i stedet GPSLogger (kun Android), kan du opnå noget lignende ved
> at konfigurere et "Custom URL"-logging-mål med samme URL og en JSON-body
> der matcher feltnavnene `lat`/`lon`/`tst`/`_type=location` — men det er
> **ikke** det, der er testet og dokumenteret her, og understøtter ikke iOS.

#### Trin 2 — Juster (valgfrit) hvor gammel en position må være

`MAX_LOCATION_AGE_MINUTES` i `functions/.env` styrer hvor mange minutter en
gemt position højst må være gammel, før siden i stedet viser en besked om at
positionen er for gammel (standard: 30 minutter).

#### Trin 3 — Deploy

Er Firebase og Cloud Functions allerede sat op (Trin 1-4 i opgavelisten
ovenfor), kræver denne funktion blot:

```bash
firebase deploy --only firestore:rules,functions
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
