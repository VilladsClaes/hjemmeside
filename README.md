# mig.villadsclaes.dk

Villads Claes' personlige hjemmeside. Ren HTML, CSS og JavaScript uden build-trin og uden afhængigheder.

## Struktur

```
index.html      Forside: om mig, værdier, drømme, personaer, familie, kontakt
cv.html         CV (kan gemmes som PDF via knappen eller Ctrl+P)
css/style.css   Al styling. Farverne ligger som variabler øverst i filen
js/main.js      Hilsen efter tidspunkt, lyst/mørkt tema, menu og scroll-animation
img/            Læg dine billeder her
CNAME           Domænet til GitHub Pages
```

## Ret indholdet

Søg efter `✏️` i `index.html` og `cv.html`. Alt i `[firkantede parenteser]` er pladsholdere, du skal erstatte.

- **Billede af dig:** læg det i `img/villads.jpg`, og fjern kommentaren omkring `<img>` i `.portrait` og `.cv-photo`.
- **Drømmestatus:** `tag-sun` = I gang, `tag-fjord` = En dag, `tag-sage` = Opnået.
- **Kompetenceniveau i CV:** ret `--level: 80%`.
- **Farver:** ret variablerne i `:root` øverst i `css/style.css`.

## Kør lokalt

```bash
python -m http.server 5173
```

Åbn derefter http://localhost:5173.

## Udgiv på GitHub Pages

1. Læg filerne i repoet `VilladsClaes/hjemmeside`, og push til `main`.
2. Gå til **Settings → Pages**, og vælg *Deploy from a branch*, `main`, `/ (root)`.
3. Ved din DNS-udbyder: opret en `CNAME`-record for `mig` med værdien `villadsclaes.github.io`.
4. Slå **Enforce HTTPS** til, når certifikatet er klar.
