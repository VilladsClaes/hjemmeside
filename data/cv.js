// Mit CV som data. Bruges af legepladsens CV-demoer (tidslinje, trin, medaljer og det periodiske system).
// cv.html er stadig skrevet i ren HTML, så den kan printes og læses uden JavaScript. Husk at rette begge steder.
window.VC_DATA = window.VC_DATA || {};
window.VC_DATA.cv = {
  // Nyeste først, ligesom på cv.html
  forloeb: [
    {
      fra: "December 2025", til: "juni 2026", aar: 2025,
      titel: "Lærer (vikariat for sygemelding)", sted: "Herskind Skole",
      kort: "Lærer",
      punkter: ["Undervisning i billedkunst ud over linjefag", "Skabende og tryg undervisning i en varieret praksis"]
    },
    {
      fra: "August 2021", til: "juni 2025", aar: 2021,
      titel: "Læreruddannelsen, professionsbachelor", sted: "UC Syd",
      kort: "Læreruddannelsen",
      punkter: ["Linjefag i Matematik 1.-6. klasse", "Linjefag i Natur/Teknologi", "Linjefag i Håndværk & Design", "Merit for Samfundsfag", "Bachelorprojekt: Ansvarsforhandling i skole-hjem-samarbejdet"]
    },
    {
      fra: "Februar 2018", til: "oktober 2019", aar: 2018,
      titel: "Webintegrator / webudvikler", sted: "Aarhus Tech",
      kort: "Webudvikler",
      punkter: ["Undervisning i C#, JavaScript, HTML og CSS", "Grundlæggende webudviklingskompetencer og digital problemløsning", "Arbejder med brugervenlige og funktionelle løsninger"]
    },
    {
      fra: "August 2009", til: "januar 2014", aar: 2009,
      titel: "BA i lingvistik", sted: "Aarhus Universitet",
      kort: "Lingvistik",
      punkter: ["Skriftlig fremstilling og mundtlig formidling", "Antropologisk lingvistik og psykolingvistik", "Sidefag i erhvervsøkonomi"]
    }
  ],

  // De ti kompetenceområder fra forsiden
  omraader: [
    { id: "teaching", ikon: "✎", titel: "Undervisning & didaktik", beskrivelse: "Jeg skaber tydelige, trygge læringsrum, hvor flere får lyst og mulighed for at lykkes.", evner: ["Didaktik og klasseledelse", "Matematik", "Natur/teknologi", "Håndværk & design", "Differentiering", "Formativ evaluering"] },
    { id: "language", ikon: "❝", titel: "Sprog & lingvistik", beskrivelse: "Min lingvistiske baggrund hjælper mig med at finde struktur og mening i sprog — og gøre den forståelig for andre.", evner: ["BA i lingvistik", "Semantik og informationsstruktur", "Sproglig analyse", "Skriftlig og mundtlig formidling"] },
    { id: "digital", ikon: "⌘", titel: "Web & digital læring", beskrivelse: "Jeg udvikler digitale løsninger og formidler teknologien, så den bliver lettere at bruge i praksis.", evner: ["HTML og CSS", "JavaScript", "C#", "Webudvikling", "Digital læring", "IT-support og guides", "Microsoft Office", "Git"] },
    { id: "ai", ikon: "✦", titel: "AI, automatisering & Hyponet", beskrivelse: "Jeg udforsker, hvordan sproglig viden og semantiske modeller kan hjælpe digitale systemer med at finde relevant information.", evner: ["Hyponet", "Semantisk modellering", "Sprog og teknologi", "Automatiseringsidéer", "AI-projekter"] },
    { id: "communication", ikon: "◖", titel: "Kommunikation & formidling", beskrivelse: "Jeg gør komplekst stof nærværende gennem klar tekst, samtaler, vejledning og formidling til forskellige målgrupper.", evner: ["Klar skriftlig kommunikation", "Foredrag", "Vejledning", "Brugerguides", "Samtale og lytning"] },
    { id: "projects", ikon: "↗", titel: "Projekt- & eventledelse", beskrivelse: "Jeg omsætter idéer til konkrete forløb og arrangementer med retning, overblik og blik for deltagerne.", evner: ["Projektledelse", "Eventledelse", "Planlægning", "Koordinering", "Hverdagsheltene", "Arbejdsfestivalen"] },
    { id: "community", ikon: "❋", titel: "Fællesskaber & foreningsliv", beskrivelse: "Jeg engagerer mennesker og skaber rammer, hvor fællesskaber kan vokse og tage fælles ansvar.", evner: ["Foreningsledelse", "Stifter og formand", "Frivilligengagement", "Rekruttering", "Fællesskabsudvikling"] },
    { id: "facilitation", ikon: "✳", titel: "Facilitering & samskabelse", beskrivelse: "Jeg hjælper mennesker med at bidrage, lytte og udvikle løsninger sammen — også når perspektiverne er forskellige.", evner: ["Samskabelse", "Facilitering", "Tværfagligt samarbejde", "Deltagerinddragelse", "Trygge processer"] },
    { id: "craft", ikon: "⚒", titel: "Håndværk & konstruktion", beskrivelse: "Mit praktiske håndværk giver mig blik for materialer, præcision og løsninger, der skal fungere i virkeligheden.", evner: ["Tømrerfag", "Bygningskonstruktion", "CAD/CAM", "Skibsrestaurering", "Praktisk problemløsning"] },
    { id: "business", ikon: "◆", titel: "Forretning, CRM & systemer", beskrivelse: "Jeg forbinder menneskers behov med arbejdsgange, organisation og de systemer, der understøtter hverdagen.", evner: ["Erhvervsøkonomi", "Organisation og marketing", "Mikroøkonomi", "ERP", "Dynamics", "CRM"] }
  ],

  // Grundstofferne i mit lille periodiske system. gruppe: "web", "sprog" eller "fag"
  grundstoffer: [
    { symbol: "Ht", navn: "HTML", gruppe: "web", note: "Struktur og betydning i alt, jeg bygger på nettet." },
    { symbol: "Cs", navn: "CSS", gruppe: "web", note: "Layout, farver og bevægelse — som på denne side." },
    { symbol: "Js", navn: "JavaScript", gruppe: "web", note: "Interaktion, data og alle legepladsens demoer." },
    { symbol: "C#", navn: "C#", gruppe: "web", note: "Har jeg undervist i på Aarhus Tech, og den henter musikken fra Last.fm her på siden." },
    { symbol: "Gt", navn: "Git", gruppe: "web", note: "Al min kode har historik på GitHub." },
    { symbol: "Of", navn: "Microsoft Office", gruppe: "web", note: "Godt kendskab til Office og digitale værktøjer." },
    { symbol: "Da", navn: "Dansk", gruppe: "sprog", note: "Modersmål." },
    { symbol: "En", navn: "Engelsk", gruppe: "sprog", note: "Flydende." },
    { symbol: "De", navn: "Tysk", gruppe: "sprog", note: "Mellemniveau." },
    { symbol: "Es", navn: "Spansk", gruppe: "sprog", note: "Begynder." },
    { symbol: "Ma", navn: "Matematik", gruppe: "fag", note: "Linjefag til 1.-6. klasse." },
    { symbol: "Nt", navn: "Natur/teknologi", gruppe: "fag", note: "Linjefag." },
    { symbol: "Hd", navn: "Håndværk & design", gruppe: "fag", note: "Linjefag." },
    { symbol: "Bk", navn: "Billedkunst", gruppe: "fag", note: "Underviste jeg i på Herskind Skole." },
    { symbol: "Sa", navn: "Samfundsfag", gruppe: "fag", note: "Merit fra læreruddannelsen." }
  ],
  grupper: { web: "Web & værktøjer", sprog: "Sprog", fag: "Skolefag" },

  // Mine værdier fra forsiden
  vaerdier: [
    { navn: "Læring", tekst: "Jeg tror på undervisning, der skaber forståelse, selvtillid og plads til at udvikle sig." },
    { navn: "Klar kommunikation", tekst: "Det vigtigste er at gøre komplekst stof enkelt at forstå og nemt at bruge." },
    { navn: "Fællesskab", tekst: "De bedste løsninger bliver skabt i samarbejde med mennesker, der tør dele idéer og udfordringer." },
    { navn: "Nysgerrighed", tekst: "Jeg er konstant på udkig efter nye måder at lære, skabe og forbedre ting på." }
  ]
};
