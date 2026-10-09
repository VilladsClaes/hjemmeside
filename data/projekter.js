// Mine projekter. Én kilde til legepladsens projektdemoer (søgning, atelier, mosaik, galleri, vendekort).
// Ret her, så følger alle demoerne med. Rækkefølgen er den, projekterne vises i.
//
// tema:      bruges til filtrering — "sprog", "laering", "web" eller "faellesskab" (gerne flere)
// farve:     "fjord", "sun", "sage" eller "berry"
// link:      valgfrit — en adresse, hvor man kan læse mere
window.VC_DATA = window.VC_DATA || {};
window.VC_DATA.projekter = {
  temaer: {
    sprog: "Sprog",
    laering: "Læring",
    web: "Web",
    faellesskab: "Fællesskab"
  },
  liste: [
    {
      id: "hyponet",
      navn: "Hyponet",
      kategori: "Sprog & teknologi",
      tema: ["sprog", "web"],
      farve: "fjord",
      titel: "Et sprogligt system til digitale løsninger",
      resume: "Jeg udviklede et hyponomisk-semantisk system med afsæt i lingvistik og idéen om at gøre sproglig viden anvendelig i IT-systemer.",
      bidrag: "Omsatte lingvistiske begreber til en struktureret model og arbejdede med mulighederne for at understøtte automatisering.",
      kompetencer: ["Lingvistik", "Informationsstruktur", "Automatisering"]
    },
    {
      id: "hverdagsheltene",
      navn: "Hverdagsheltene",
      kategori: "Formidling",
      tema: ["laering", "faellesskab"],
      farve: "sun",
      titel: "Projektledelse og foredrag på højskoler",
      resume: "Som projektleder på Hverdagsheltene var jeg med til at føre projektets idé ud til mennesker gennem en foredragsturné på højskoler.",
      bidrag: "Projektledelse og formidling i samarbejde med andre.",
      kompetencer: ["Projektledelse", "Foredrag", "Samarbejde"]
    },
    {
      id: "arbejdsfestivalen",
      navn: "Arbejdsfestivalen",
      kategori: "Events & fællesskab",
      tema: ["faellesskab"],
      farve: "sage",
      titel: "At samle mennesker om en festival",
      resume: "Jeg stod for eventledelse af Arbejdsfestivalen og bidrog til at omsætte et fælles formål til et arrangement, mennesker kunne mødes om.",
      bidrag: "Eventledelse og koordinering med fokus på samarbejde og en god deltageroplevelse.",
      kompetencer: ["Eventledelse", "Koordinering", "Kommunikation"]
    },
    {
      id: "interne-vaerktoejer",
      navn: "Interne værktøjer",
      kategori: "Digital formidling",
      tema: ["web", "laering"],
      farve: "berry",
      titel: "Hjemmeside, guides og IT-support",
      resume: "Jeg har udviklet hjemmeside og guides til ansatte samt hjulpet kolleger med IT, så viden og værktøjer blev lettere at finde og bruge.",
      bidrag: "Digital udvikling, IT-support og formidling af arbejdsgange.",
      kompetencer: ["Webudvikling", "IT-support", "Brugervejledninger"]
    },
    {
      id: "bachelorprojekt",
      navn: "Bachelorprojekt",
      kategori: "Læreruddannelsen",
      tema: ["laering"],
      farve: "sage",
      titel: "Ansvarsforhandling i skole-hjem-samarbejdet",
      resume: "Mit bachelorprojekt på læreruddannelsen ved UC Syd handlede om, hvordan ansvar bliver forhandlet i samarbejdet mellem skole og hjem.",
      bidrag: "Undersøgelse og skriftlig formidling som afslutning på professionsbacheloren.",
      kompetencer: ["Skole-hjem-samarbejde", "Undersøgelse", "Skriftlig formidling"]
    },
    {
      id: "hjemmesiden",
      navn: "Denne hjemmeside",
      kategori: "Webudvikling",
      tema: ["web"],
      farve: "fjord",
      titel: "En personlig side uden byggetrin",
      resume: "Siden her er skrevet i ren HTML, CSS og JavaScript og udgives automatisk fra GitHub til mit webhotel.",
      bidrag: "Design, kode og indhold — inklusive legepladsen, musik fra Last.fm og en delt opgaveliste.",
      kompetencer: ["HTML og CSS", "JavaScript", "Git og GitHub Actions"],
      link: "https://github.com/VilladsClaes/hjemmeside"
    }
  ]
};
