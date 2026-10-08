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
index.html            Forside: om mig, værdier, drømme, personaer, familie, kontakt
cv.html               CV (kan gemmes som PDF via knappen eller Ctrl+P)
legeplads.html        122 interaktive UI- og CSS/JS-eksperimenter, porteret fra CodePen-idéer
opgaveliste.html      Offentlig, delt opgaveliste — besøgende kan foreslå/tage opgaver
opgaveliste-admin.html Admin-side (kun ejeren) til at godkende forslag og forbinde Microsoft To Do
css/style.css         Al styling. Farverne ligger som variabler øverst i filen
js/main.js            Hilsen efter tidspunkt, lyst/mørkt tema, menu og scroll-animation
js/legeplads.js       Interaktioner til legepladsens 122 små demoer
js/firebase-config.js Firebase-projektets web-config (udfyldes ved opsætning, se nedenfor)
js/opgaveliste.js     Logik til den offentlige opgaveliste
js/opgaveliste-admin.js Logik til admin-siden
functions/            Firebase Cloud Functions: godkendelse + synkronisering med Microsoft To Do/Google Tasks
firestore.rules        Firestore-sikkerhedsregler til opgavelisten
img/                  Læg dine billeder her
```

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
   → actionér **Google** som sign-in-metode.
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

### Trin 5 — Forbind Microsoft To Do

Log ind på `opgaveliste-admin.html` og klik **"Forbind Microsoft To Do"**. Det
åbner Microsofts login i en ny fane; godkend adgangen, og du er klar. (Hvis du
i stedet vælger Google Tasks som fallback, bruges "Forbind Google Tasks"-
knappen, og `ACTIVE_PROVIDER` i `.env` skal sættes til `google`.)

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
