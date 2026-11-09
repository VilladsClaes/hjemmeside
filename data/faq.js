// Ofte stillede spørgsmål om mig og mine projekter. Bruges af legepladsens billetkort (#billetter).
// Indholdet er hentet fra cv.js/projekter.js — ret der, hvis fakta ændrer sig, og her, hvis selve spørgsmålet skal ændres.
window.VC_DATA = window.VC_DATA || {};
window.VC_DATA.faq = {
  // farve: "fjord", "sun" eller "sage" — samme palet som de andre billetfarver
  emner: {
    "om-mig": { navn: "Om mig", farve: "fjord" },
    "arbejde": { navn: "Arbejde & projekter", farve: "sun" },
    "praktisk": { navn: "Praktisk", farve: "sage" }
  },
  liste: [
    {
      emne: "om-mig",
      titel: "Hvem er du?",
      svar: "Jeg er Villads Claes — lærer med linjefag i matematik, natur/teknologi og håndværk & design, og webudvikler ved siden af. Jeg har desuden en BA i lingvistik, som jeg trækker på i mit arbejde med sprog og digitale systemer."
    },
    {
      emne: "om-mig",
      titel: "Hvad laver du lige nu?",
      svar: "Jeg er i vikariat som lærer på Herskind Skole, hvor jeg underviser i billedkunst ud over mine linjefag. Jeg er netop færdig med læreruddannelsen på UC Syd."
    },
    {
      emne: "om-mig",
      titel: "Hvad lavede du, før du blev lærer?",
      svar: "Jeg arbejdede som webintegrator/webudvikler på Aarhus Tech, hvor jeg underviste i C#, JavaScript, HTML og CSS. Før det læste jeg en BA i lingvistik på Aarhus Universitet."
    },
    {
      emne: "arbejde",
      titel: "Hvad er Hyponet?",
      svar: "Hyponet er et hyponomisk-semantisk system, jeg har udviklet med afsæt i lingvistik — idéen er at gøre sproglig viden anvendelig i IT-systemer, så de bedre kan finde relevant information."
    },
    {
      emne: "arbejde",
      titel: "Har du undervist i webudvikling?",
      svar: "Ja — på Aarhus Tech underviste jeg i C#, JavaScript, HTML og CSS og arbejdede med grundlæggende webudviklingskompetencer og digital problemløsning."
    },
    {
      emne: "arbejde",
      titel: "Er koden til denne hjemmeside open source?",
      svar: "Ja. Hele siden er ren HTML, CSS og JavaScript uden byggetrin, og koden ligger offentligt tilgængelig på GitHub under VilladsClaes/hjemmeside."
    },
    {
      emne: "praktisk",
      titel: "Hvordan kontakter jeg dig?",
      svar: "Nemmeste vej er mail: villadsclaes@gmail.com — jeg svarer gerne på spørgsmål om undervisning, webudvikling eller projekterne her på siden."
    },
    {
      emne: "praktisk",
      titel: "Hvad er legepladsen her på siden?",
      svar: "Legepladsen er en samling af interaktive UI- og CSS/JS-eksperimenter, porteret fra idéer jeg har arbejdet med på CodePen — nogle er rene demoer, andre (som denne) bygger på rigtigt indhold."
    }
  ]
};
