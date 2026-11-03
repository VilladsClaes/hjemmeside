// Et lille, håndlavet ordnet: begreber og deres betydningsforhold.
// Bruges af legepladsens sprogdemoer (semantisk netværk, ordkort, ordbog og bogstaver).
// Formatet er tænkt, så det senere kan skiftes ud med data fra Hyponet.
//
// over:  id på overbegrebet (hyponymi: "x er en slags y")
// del:   id på helheden (meronymi: "x er en del af y")
// se:    id'er på begreber, der hænger sammen med dette (association)
// kort:  true, hvis ordet skal med i ordkortene
window.VC_DATA = window.VC_DATA || {};
window.VC_DATA.ordnet = {
  relationer: {
    over: { navn: "er en slags", omvendt: "underbegreber" },
    del: { navn: "er en del af", omvendt: "dele" },
    se: { navn: "hænger sammen med", omvendt: "hænger sammen med" }
  },
  start: "sprog",
  begreber: [
    // Sprog
    { id: "sprog", ord: "sprog", klasse: "navneord", def: "Et system af tegn, som mennesker bruger til at kommunikere og tænke med.", se: ["lingvistik"] },
    { id: "naturligt-sprog", ord: "naturligt sprog", klasse: "navneord", def: "Et sprog, der er opstået og har udviklet sig gennem brug i et fællesskab.", over: "sprog" },
    { id: "dansk", ord: "dansk", klasse: "navneord", def: "Et nordgermansk sprog, der især tales i Danmark.", over: "naturligt-sprog" },
    { id: "engelsk", ord: "engelsk", klasse: "navneord", def: "Et vestgermansk sprog, der tales som modersmål eller fællessprog over hele verden.", over: "naturligt-sprog" },
    { id: "tysk", ord: "tysk", klasse: "navneord", def: "Et vestgermansk sprog, der især tales i Tyskland, Østrig og Schweiz.", over: "naturligt-sprog" },
    { id: "spansk", ord: "spansk", klasse: "navneord", def: "Et romansk sprog, der tales i Spanien og store dele af Latinamerika.", over: "naturligt-sprog" },
    { id: "tegnsprog", ord: "dansk tegnsprog", klasse: "navneord", def: "Et visuelt, naturligt sprog med sin egen grammatik, som bruges af døve i Danmark.", over: "naturligt-sprog" },
    { id: "kunstigt-sprog", ord: "kunstigt sprog", klasse: "navneord", def: "Et sprog, der er konstrueret bevidst til et bestemt formål.", over: "sprog" },
    { id: "esperanto", ord: "esperanto", klasse: "navneord", def: "Et plansprog, der blev skabt i 1887 som et neutralt fællessprog.", over: "kunstigt-sprog" },
    { id: "programmeringssprog", ord: "programmeringssprog", klasse: "navneord", def: "Et kunstigt sprog til at give en computer præcise instruktioner.", over: "kunstigt-sprog" },
    { id: "javascript", ord: "JavaScript", klasse: "navneord", def: "Et programmeringssprog, som browsere bruger til at gøre hjemmesider interaktive.", over: "programmeringssprog", se: ["html"] },
    { id: "csharp", ord: "C#", klasse: "navneord", def: "Et programmeringssprog fra Microsoft, der bl.a. bruges til webservere og programmer.", over: "programmeringssprog" },
    { id: "opmaerkningssprog", ord: "opmærkningssprog", klasse: "navneord", def: "Et kunstigt sprog, der markerer struktur og betydning i en tekst.", over: "kunstigt-sprog" },
    { id: "html", ord: "HTML", klasse: "navneord", def: "Det opmærkningssprog, der giver indholdet på en hjemmeside struktur.", over: "opmaerkningssprog" },

    // Sprogets byggesten
    { id: "tekst", ord: "tekst", klasse: "navneord", def: "En sammenhængende helhed af sprog, skrevet eller talt.", se: ["sprog"] },
    { id: "saetning", ord: "sætning", klasse: "navneord", def: "En sproglig enhed, der typisk har et udsagnsled og et grundled.", del: "tekst", kort: true },
    { id: "ord", ord: "ord", klasse: "navneord", def: "Den mindste sproglige enhed, der kan stå alene og har betydning.", del: "saetning" },
    { id: "morfem", ord: "morfem", klasse: "navneord", def: "Den mindste del af et ord, der bærer betydning — fx 'hus' og '-e' i 'huse'.", del: "ord", kort: true },
    { id: "fonem", ord: "fonem", klasse: "navneord", def: "Den mindste lydenhed, der kan skelne mellem betydninger — fx /p/ og /b/ i 'pære' og 'bære'.", se: ["fonologi"], kort: true },

    // Lingvistik
    { id: "lingvistik", ord: "lingvistik", klasse: "navneord", def: "Videnskaben om sprog: hvordan det er bygget op, bruges og forandrer sig.", eks: "Jeg har en BA i lingvistik fra Aarhus Universitet." },
    { id: "semantik", ord: "semantik", klasse: "navneord", def: "Den del af lingvistikken, der undersøger betydning.", over: "lingvistik", se: ["betydningsforhold"], kort: true },
    { id: "pragmatik", ord: "pragmatik", klasse: "navneord", def: "Den del af lingvistikken, der undersøger, hvordan sprog bruges og forstås i en situation.", over: "lingvistik", kort: true },
    { id: "syntaks", ord: "syntaks", klasse: "navneord", def: "Læren om, hvordan ord sættes sammen til sætninger.", over: "lingvistik", se: ["saetning"], kort: true },
    { id: "morfologi", ord: "morfologi", klasse: "navneord", def: "Læren om ordenes opbygning og bøjning.", over: "lingvistik", se: ["morfem"], kort: true },
    { id: "fonologi", ord: "fonologi", klasse: "navneord", def: "Læren om sprogets lydsystem.", over: "lingvistik", kort: true },
    { id: "psykolingvistik", ord: "psykolingvistik", klasse: "navneord", def: "Undersøger, hvordan hjernen lærer, forstår og producerer sprog.", over: "lingvistik", kort: true },
    { id: "antropologisk-lingvistik", ord: "antropologisk lingvistik", klasse: "navneord", def: "Undersøger sammenhængen mellem sprog, kultur og samfund.", over: "lingvistik", kort: true },

    // Betydningsforhold
    { id: "betydningsforhold", ord: "betydningsforhold", klasse: "navneord", def: "En relation mellem ord på grund af deres betydning." },
    { id: "hyponymi", ord: "hyponymi", klasse: "navneord", def: "Forholdet mellem et underbegreb og et overbegreb: en rose er en slags blomst.", over: "betydningsforhold", se: ["hyponet"], eks: "'Rose' er et hyponym af 'blomst'.", kort: true },
    { id: "meronymi", ord: "meronymi", klasse: "navneord", def: "Forholdet mellem en del og en helhed: et hjul er en del af en cykel.", over: "betydningsforhold", eks: "'Morfem' er et meronym af 'ord'.", kort: true },
    { id: "synonymi", ord: "synonymi", klasse: "navneord", def: "Når to ord betyder (næsten) det samme: 'begynde' og 'starte'.", over: "betydningsforhold", kort: true },
    { id: "antonymi", ord: "antonymi", klasse: "navneord", def: "Når to ord betyder det modsatte: 'varm' og 'kold'.", over: "betydningsforhold", kort: true },
    { id: "polysemi", ord: "polysemi", klasse: "navneord", def: "Når ét ord har flere beslægtede betydninger: en 'mus' i køkkenet og ved computeren.", over: "betydningsforhold", kort: true },

    // Semantiske modeller
    { id: "semantisk-model", ord: "semantisk model", klasse: "navneord", def: "En struktureret beskrivelse af begreber og forholdene mellem dem, som en computer kan arbejde med.", se: ["semantik"] },
    { id: "ordnet-begreb", ord: "ordnet", klasse: "navneord", def: "En semantisk model, der forbinder ord gennem betydningsforhold som over- og underbegreber.", over: "semantisk-model", kort: true },
    { id: "dannet", ord: "DanNet", klasse: "navneord", def: "Et ordnet for dansk, udviklet af Københavns Universitet og Det Danske Sprog- og Litteraturselskab.", over: "ordnet-begreb", se: ["dansk"] },
    { id: "hyponet", ord: "Hyponet", klasse: "navneord", def: "Mit hyponomisk-semantiske system, der ordner begreber efter over- og underbegreber, så sproglig viden kan bruges i IT-systemer.", over: "semantisk-model", se: ["hyponymi"] },

    // Fællesskaber (samme træ som værkstedet på forsiden)
    { id: "faellesskab", ord: "fællesskab", klasse: "navneord", def: "En gruppe mennesker, der deler noget." },
    { id: "laeringsfaellesskab", ord: "læringsfællesskab", klasse: "navneord", def: "Et fællesskab, hvor mennesker lærer sammen.", over: "faellesskab" },
    { id: "klassefaellesskab", ord: "klassefællesskab", klasse: "navneord", def: "Et læringsfællesskab, der samles omkring en klasse.", over: "laeringsfaellesskab" },
    { id: "studiegruppe", ord: "studiegruppe", klasse: "navneord", def: "Et læringsfællesskab, hvor en mindre gruppe studerer sammen.", over: "laeringsfaellesskab" },
    { id: "arbejdsfaellesskab", ord: "arbejdsfællesskab", klasse: "navneord", def: "Et fællesskab, der opstår omkring arbejde.", over: "faellesskab" },
    { id: "projektfaellesskab", ord: "projektfællesskab", klasse: "navneord", def: "Et arbejdsfællesskab omkring en fælles opgave eller et projekt.", over: "arbejdsfaellesskab" },
    { id: "fritidsfaellesskab", ord: "fritidsfællesskab", klasse: "navneord", def: "Et fællesskab, der samles om interesser eller aktiviteter i fritiden.", over: "faellesskab" },
    { id: "forening", ord: "forening", klasse: "navneord", def: "Et fritidsfællesskab organiseret omkring en fælles interesse.", over: "fritidsfaellesskab" },

    // Udsagnsord og tillægsord, så ordbogen har mere end navneord
    { id: "laere", ord: "lære", klasse: "udsagnsord", def: "At tilegne sig ny viden eller nye færdigheder.", se: ["laeringsfaellesskab"] },
    { id: "formidle", ord: "formidle", klasse: "udsagnsord", def: "At gøre viden forståelig og tilgængelig for andre.", se: ["tekst"] },
    { id: "nysgerrig", ord: "nysgerrig", klasse: "tillægsord", def: "Villig til at undersøge, spørge og lære noget nyt.", se: ["laere"] }
  ]
};
