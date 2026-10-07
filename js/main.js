// Små, rolige detaljer: hilsen efter tidspunkt, mørk/lys tilstand, menu og blid animation ved scroll.
(function () {
  var root = document.documentElement;
  root.classList.remove("no-js");

  // Tema — husk brugerens valg, ellers følg systemet
  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  // Hilsen efter tidspunkt på dagen
  var greet = document.querySelector("[data-greeting]");
  if (greet) {
    var h = new Date().getHours();
    var text = h < 5 ? "God nat" : h < 10 ? "God morgen" : h < 12 ? "God formiddag" :
      h < 18 ? "God eftermiddag" : "God aften";
    greet.textContent = text;
  }

  // Mobilmenu
  var menuBtn = document.querySelector("[data-menu]");
  var links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Header-kant når man scroller
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Elementer glider blidt ind
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (el.dataset.delay || 0) + "ms";
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Små værksteder: begrebskort, målgruppetilpasset forklaring og øvelsesidé
  var explorer = document.querySelector("[data-word-explorer]");
  if (explorer) {
    var wordNodes = {
      faellesskab: {
        label: "Fællesskab",
        description: "Et fællesskab er en gruppe mennesker, der deler noget.",
        children: ["laering", "arbejde", "fritid"]
      },
      laering: {
        label: "Læringsfællesskab",
        description: "Et fællesskab, hvor mennesker lærer sammen.",
        parent: "faellesskab",
        children: ["klasse", "studiegruppe"]
      },
      klasse: {
        label: "Klassefællesskab",
        description: "Et læringsfællesskab, der samles omkring en klasse.",
        parent: "laering"
      },
      studiegruppe: {
        label: "Studiegruppe",
        description: "Et læringsfællesskab, hvor en mindre gruppe studerer sammen.",
        parent: "laering"
      },
      arbejde: {
        label: "Arbejdsfællesskab",
        description: "Et fællesskab, der opstår omkring arbejde.",
        parent: "faellesskab",
        children: ["kolleger", "projekt"]
      },
      kolleger: {
        label: "Kollegafællesskab",
        description: "Et arbejdsfællesskab mellem kolleger.",
        parent: "arbejde"
      },
      projekt: {
        label: "Projektfællesskab",
        description: "Et arbejdsfællesskab omkring en fælles opgave eller et projekt.",
        parent: "arbejde"
      },
      fritid: {
        label: "Fritidsfællesskab",
        description: "Et fællesskab, der samles om interesser eller aktiviteter i fritiden.",
        parent: "faellesskab",
        children: ["forening", "spil"]
      },
      forening: {
        label: "Forening",
        description: "Et fritidsfællesskab organiseret omkring en fælles interesse.",
        parent: "fritid"
      },
      spil: {
        label: "Spilfællesskab",
        description: "Et fritidsfællesskab, der mødes om at spille.",
        parent: "fritid"
      }
    };
    var breadcrumb = explorer.querySelector("[data-word-breadcrumb]");
    var description = explorer.querySelector("[data-word-description]");
    var choices = explorer.querySelector("[data-word-choices]");
    var currentWord = "faellesskab";

    var renderWord = function () {
      var node = wordNodes[currentWord];
      var path = [];
      var ancestor = currentWord;
      while (ancestor) {
        path.unshift(ancestor);
        ancestor = wordNodes[ancestor].parent;
      }

      breadcrumb.textContent = "";
      path.forEach(function (id, index) {
        if (index > 0) {
          var separator = document.createElement("span");
          separator.setAttribute("aria-hidden", "true");
          separator.textContent = "/";
          breadcrumb.appendChild(separator);
        }
        if (index === path.length - 1) {
          var current = document.createElement("span");
          current.setAttribute("aria-current", "location");
          current.textContent = wordNodes[id].label;
          breadcrumb.appendChild(current);
        } else {
          var ancestorButton = document.createElement("button");
          ancestorButton.type = "button";
          ancestorButton.dataset.wordNode = id;
          ancestorButton.setAttribute("aria-label", "Gå tilbage til " + wordNodes[id].label);
          ancestorButton.textContent = wordNodes[id].label;
          breadcrumb.appendChild(ancestorButton);
        }
      });

      description.textContent = node.description;
      choices.textContent = "";
      (node.children || []).forEach(function (childId) {
        var button = document.createElement("button");
        button.className = "word-choice";
        button.type = "button";
        button.dataset.wordNode = childId;
        button.appendChild(document.createTextNode(wordNodes[childId].label));
        var arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";
        button.appendChild(arrow);
        choices.appendChild(button);
      });
      if (!node.children) {
        var endNote = document.createElement("p");
        endNote.className = "workshop-prompt";
        endNote.textContent = "Du er nået til et konkret eksempel.";
        choices.appendChild(endNote);
      }
    };

    explorer.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-word-node]");
      if (button && explorer.contains(button)) {
        currentWord = button.dataset.wordNode;
        renderWord();
      }
    });
    renderWord();
  }

  var explainTopic = document.querySelector("[data-explain-topic]");
  var explainAudience = document.querySelector("[data-explain-audience]");
  var explainOutput = document.querySelector("[data-explain-output]");
  if (explainTopic && explainAudience && explainOutput) {
    var explanations = {
      html: {
        barn: "HTML er byggestenene, der fortæller en browser, hvad en hjemmeside indeholder – for eksempel en overskrift eller en knap.",
        kollega: "HTML beskriver sidens indhold og struktur, for eksempel overskrifter, afsnit og links. CSS står for udseendet, og JavaScript kan tilføje interaktion.",
        nysgerrig: "HTML er et opmærkningssprog, der giver indhold på nettet en struktur og betydning, som både browsere og hjælpemidler kan forstå."
      },
      klasseledelse: {
        barn: "Klasseledelse er, når læreren hjælper klassen med at vide, hvad der skal ske, så alle får ro og plads til at lære.",
        kollega: "Klasseledelse handler om at skabe tydelige rammer og gode relationer, så eleverne kan deltage trygt og undervisningen får retning.",
        nysgerrig: "Klasseledelse er lærerens arbejde med relationer, struktur og deltagelse for at understøtte et trygt læringsmiljø."
      },
      hyponymi: {
        barn: "En rose er en slags blomst. Når ét ord er en mere præcis slags af et andet, er ordene i sådan et forhold.",
        kollega: "Hyponymi er et betydningsforhold, hvor et mere specifikt ord hører under et bredere: rose er fx en hyponym til blomst.",
        nysgerrig: "Hyponymi beskriver et hierarkisk betydningsforhold: En rose er en type blomst, og blomst er overbegreb for rose."
      }
    };
    var updateExplanation = function () {
      explainOutput.textContent = explanations[explainTopic.value][explainAudience.value];
    };
    explainTopic.addEventListener("change", updateExplanation);
    explainAudience.addEventListener("change", updateExplanation);
  }

  var activityForm = document.querySelector("[data-activity-form]");
  var activityOutput = document.querySelector("[data-activity-output]");
  if (activityForm && activityOutput) {
    var activities = {
      ord: {
        undersoeg: "Undersøg et ord, du møder i dag. Hvad tror du, det betyder – og hvilke andre ord hjælper dig med at forstå det?",
        proev: "Vælg et ord, og byt det ud med et beslægtet ord i en sætning. Hvad ændrer sig i betydningen?",
        forklar: "Forklar et nyt ord til en anden uden at bruge selve ordet. Hvilke eksempler gør betydningen tydelig?"
      },
      web: {
        undersoeg: "Find en overskrift og et link på en hjemmeside. Hvilke HTML-elementer tror du, browseren bruger til dem?",
        proev: "Skriv en kort HTML-side med en overskrift, et afsnit og et link. Prøv at ændre rækkefølgen på elementerne.",
        forklar: "Forklar med dine egne ord, hvordan HTML hjælper en browser med at forstå indholdet på en side."
      },
      matematik: {
        undersoeg: "Find tre ting omkring dig, der kan tælles eller måles. Hvilke forskellige måder kan du sammenligne dem på?",
        proev: "Vælg et tal mellem 20 og 100. Find mindst to regnestykker, der giver tallet, og vis hvordan du ved det.",
        forklar: "Vælg en måde at løse et regnestykke på, og forklar hvert trin, så en anden kan følge din tanke."
      }
    };
    activityForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var formData = new FormData(activityForm);
      activityOutput.textContent = activities[formData.get("topic")][formData.get("mode")];
    });
  }

  // Årstal i footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Print-knap på CV
  var printBtn = document.querySelector("[data-print]");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
})();
