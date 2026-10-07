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

  // Årstal i footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Skrivemaskine med en fast, skærmlæservenlig tekst som alternativ
  var typewriter = document.querySelector("[data-typewriter]");
  if (typewriter && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var typewriterPhrases = [
      "gøre komplekst stof let at forstå.",
      "skabe trygge læringsrum med plads til alle.",
      "finde mønstre i sprog og information.",
      "bygge digitale værktøjer, der er til at bruge.",
      "bruge AI og semantik til at finde mening.",
      "føre projekter fra idé til virkelighed.",
      "få mennesker til at skabe løsninger sammen.",
      "samle frivillige om et fælles mål.",
      "forene CRM, forretning og menneskers behov.",
      "kombinere analyse med praktisk håndværk."
    ];
    var typewriterIndex = 0;
    var typewriterLength = Array.from(typewriterPhrases[0]).length;
    var typewriterDeleting = true;
    function typewriterStep() {
      var phrase = Array.from(typewriterPhrases[typewriterIndex]);
      typewriterLength += typewriterDeleting ? -1 : 1;
      typewriter.textContent = phrase.slice(0, typewriterLength).join("");
      var delay = typewriterDeleting ? 32 : 58;
      if (!typewriterDeleting && typewriterLength === phrase.length) {
        typewriterDeleting = true;
        delay = 1700;
      } else if (typewriterDeleting && typewriterLength === 0) {
        typewriterDeleting = false;
        typewriterIndex = (typewriterIndex + 1) % typewriterPhrases.length;
        delay = 280;
      }
      window.setTimeout(typewriterStep, delay);
    }
    window.setTimeout(typewriterStep, 1700);
  }

  // Kompetencekort og lige store SVG-sektorer uden eksterne diagram-biblioteker
  var competencyChart = document.querySelector("[data-competency-chart]");
  if (competencyChart) {
    var competencyAreas = {
      teaching: {
        title: "Undervisning & didaktik",
        description: "Jeg skaber tydelige, trygge læringsrum, hvor flere får lyst og mulighed for at lykkes.",
        skills: ["Didaktik og klasseledelse", "Matematik", "Natur/teknologi", "Håndværk & design", "Differentiering", "Formativ evaluering"]
      },
      language: {
        title: "Sprog & lingvistik",
        description: "Min lingvistiske baggrund hjælper mig med at finde struktur og mening i sprog — og gøre den forståelig for andre.",
        skills: ["BA i lingvistik", "Semantik og informationsstruktur", "Sproglig analyse", "Skriftlig og mundtlig formidling", "Dansk: modersmål", "Engelsk: flydende", "Tysk: mellemniveau", "Spansk: begynder"]
      },
      digital: {
        title: "Web & digital læring",
        description: "Jeg udvikler digitale løsninger og formidler teknologien, så den bliver lettere at bruge i praksis.",
        skills: ["HTML og CSS", "JavaScript", "C#", "Webudvikling", "Digital læring", "IT-support og guides", "Microsoft Office", "Git"]
      },
      ai: {
        title: "AI, automatisering & Hyponet",
        description: "Jeg udforsker, hvordan sproglig viden og semantiske modeller kan hjælpe digitale systemer med at finde relevant information.",
        skills: ["Hyponet", "Semantisk modellering", "Sprog og teknologi", "Automatiseringsidéer", "AI-projekter"]
      },
      communication: {
        title: "Kommunikation & formidling",
        description: "Jeg gør komplekst stof nærværende gennem klar tekst, samtaler, vejledning og formidling til forskellige målgrupper.",
        skills: ["Klar skriftlig kommunikation", "Foredrag", "Vejledning", "Brugerguides", "Samtale og lytning"]
      },
      projects: {
        title: "Projekt- & eventledelse",
        description: "Jeg omsætter idéer til konkrete forløb og arrangementer med retning, overblik og blik for deltagerne.",
        skills: ["Projektledelse", "Eventledelse", "Planlægning", "Koordinering", "Hverdagsheltene", "Arbejdsfestivalen"]
      },
      community: {
        title: "Fællesskaber & foreningsliv",
        description: "Jeg engagerer mennesker og skaber rammer, hvor fællesskaber kan vokse og tage fælles ansvar.",
        skills: ["Foreningsledelse", "Stifter og formand", "Frivilligengagement", "Rekruttering", "Fællesskabsudvikling"]
      },
      facilitation: {
        title: "Facilitering & samskabelse",
        description: "Jeg hjælper mennesker med at bidrage, lytte og udvikle løsninger sammen — også når perspektiverne er forskellige.",
        skills: ["Samskabelse", "Facilitering", "Tværfagligt samarbejde", "Deltagerinddragelse", "Trygge processer"]
      },
      craft: {
        title: "Håndværk & konstruktion",
        description: "Mit praktiske håndværk giver mig blik for materialer, præcision og løsninger, der skal fungere i virkeligheden.",
        skills: ["Tømrerfag", "Bygningskonstruktion", "CAD/CAM", "Skibsrestaurering", "Praktisk problemløsning"]
      },
      business: {
        title: "Forretning, CRM & systemer",
        description: "Jeg forbinder menneskers behov med arbejdsgange, organisation og de systemer, der understøtter hverdagen.",
        skills: ["Erhvervsøkonomi", "Organisation og marketing", "Mikroøkonomi", "ERP", "Dynamics", "CRM"]
      }
    };
    var competencyButtons = competencyChart.querySelectorAll("[data-competency-select]");
    var competencySegments = competencyChart.querySelectorAll("[data-competency-segment]");
    var competencyTitle = competencyChart.querySelector("[data-competency-title]");
    var competencyDescription = competencyChart.querySelector("[data-competency-description]");
    var competencySkills = competencyChart.querySelector("[data-competency-skills]");
    if (competencyButtons.length && competencySegments.length && competencyTitle && competencyDescription && competencySkills) {
      var circumference = competencySegments[0].getTotalLength();
      var segmentGap = 6;
      var segmentLength = circumference / competencySegments.length - segmentGap;
      competencySegments.forEach(function (segment, index) {
        segment.style.strokeDasharray = segmentLength + " " + (circumference - segmentLength);
        segment.style.strokeDashoffset = -(index * circumference / competencySegments.length);
      });
      function showCompetency(key) {
        var area = competencyAreas[key];
        if (!area) return;
        competencyButtons.forEach(function (button) {
          button.setAttribute("aria-pressed", String(button.dataset.competencySelect === key));
        });
        competencySegments.forEach(function (segment) {
          segment.classList.toggle("is-active", segment.dataset.competencySegment === key);
        });
        competencyTitle.textContent = area.title;
        competencyDescription.textContent = area.description;
        competencySkills.replaceChildren();
        area.skills.forEach(function (skill) {
          var item = document.createElement("li");
          item.textContent = skill;
          competencySkills.appendChild(item);
        });
      }
      competencyButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          showCompetency(button.dataset.competencySelect);
        });
      });
      showCompetency(competencyButtons[0].dataset.competencySelect);
    }
  }

  // Print-knap på CV
  var printBtn = document.querySelector("[data-print]");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
})();
