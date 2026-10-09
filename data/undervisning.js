// Små værktøjer til undervisningen. Bruges af legepladsens klasseværktøjer.
// Tilføj gerne flere sæt — demoerne finder selv de nye.
window.VC_DATA = window.VC_DATA || {};
window.VC_DATA.undervisning = {
  // Huskespil: hvert sæt har seks par. Et par er [kort A, kort B]
  huskespil: [
    {
      id: "matematik", navn: "Matematik: figurer",
      par: [["trekant", "3 sider"], ["firkant", "4 sider"], ["femkant", "5 sider"], ["sekskant", "6 sider"], ["ottekant", "8 sider"], ["cirkel", "ingen hjørner"]]
    },
    {
      id: "engelsk", navn: "Engelsk: gloser",
      par: [["curious", "nysgerrig"], ["to share", "at dele"], ["question", "spørgsmål"], ["friendship", "venskab"], ["to listen", "at lytte"], ["brave", "modig"]]
    },
    {
      id: "nt", navn: "Natur/teknologi: tilstandsformer",
      par: [["is", "fast stof"], ["vand", "væske"], ["damp", "gas"], ["smelte", "fast → væske"], ["fordampe", "væske → gas"], ["fryse", "væske → fast"]]
    },
    {
      id: "sprog", navn: "Sprog: over- og underbegreber",
      par: [["rose", "blomst"], ["gulerod", "grøntsag"], ["hammer", "værktøj"], ["spurv", "fugl"], ["sofa", "møbel"], ["dansk", "sprog"]]
    }
  ],

  // Exit ticket: tre spørgsmål efter en lektion. svar = faste valg; tom liste = fritekst
  exitTicket: [
    { spoergsmaal: "Hvor godt forstod du dagens emne?", svar: ["Jeg kan forklare det", "Jeg er næsten der", "Jeg har brug for hjælp"] },
    { spoergsmaal: "Hvordan var tempoet?", svar: ["For hurtigt", "Tilpas", "For langsomt"] },
    { spoergsmaal: "Hvad tager du med fra i dag?", svar: [] }
  ],

  // Hurtigvalg til opgavetimeren, i minutter
  timer: [3, 5, 10, 15, 20],

  // Materialer pr. gruppe til materialeberegneren. Eksemplet kan rettes direkte på siden
  materialer: {
    navn: "Eksempel: et forsøg i små grupper",
    proGruppe: [
      { ting: "Bægerglas", antal: 2, enhed: "stk." },
      { ting: "Termometer", antal: 1, enhed: "stk." },
      { ting: "Isterninger", antal: 6, enhed: "stk." },
      { ting: "Logbog", antal: 1, enhed: "stk." }
    ]
  },

  // Det danske stavealfabet, til at stave navne i telefonen
  stavealfabet: {
    A: "Anna", B: "Bernhard", C: "Cecilie", D: "David", E: "Erik", F: "Frederik", G: "Georg", H: "Hans",
    I: "Ida", J: "Johan", K: "Karen", L: "Ludvig", M: "Mari", N: "Nikolaj", O: "Odin", P: "Peter",
    Q: "Quintus", R: "Rasmus", S: "Søren", T: "Theodor", U: "Ulla", V: "Viggo", W: "William", X: "Xerxes",
    Y: "Yrsa", Z: "Zackarias", "Æ": "Ærlig", "Ø": "Øresund", "Å": "Åse"
  }
};
