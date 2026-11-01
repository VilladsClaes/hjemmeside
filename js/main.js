// Små, rolige detaljer: hilsen efter tidspunkt, mørk/lys tilstand, menu og blid animation ved scroll.
(function () {
  var root = document.documentElement;
  root.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    var setMenuOpen = function (open, returnFocus) {
      links.classList.toggle("open", open);
      root.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Luk menu" : "Åbn menu");
      if (open) {
        var firstLink = links.querySelector("a");
        if (firstLink) firstLink.focus();
      } else if (returnFocus) {
        menuBtn.focus();
      }
    };
    menuBtn.addEventListener("click", function () {
      setMenuOpen(!links.classList.contains("open"), false);
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        setMenuOpen(false, false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) {
        setMenuOpen(false, true);
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 940 && links.classList.contains("open")) {
        setMenuOpen(false, false);
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

  // Parallakse holder sig diskret og er slået fra på touchskærme og ved reduceret bevægelse.
  var parallaxScene = document.querySelector("[data-parallax]");
  if (parallaxScene && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var sceneLayers = parallaxScene.querySelectorAll("[data-depth]");
    var landscapeArt = parallaxScene.querySelector(".parallax-landscape");
    parallaxScene.addEventListener("pointermove", function (event) {
      var bounds = parallaxScene.getBoundingClientRect();
      var x = (event.clientX - bounds.left) / bounds.width - .5;
      var y = (event.clientY - bounds.top) / bounds.height - .5;
      landscapeArt.style.transform = "perspective(700px) rotateX(" + (-y * 4) + "deg) rotateY(" + (x * 5) + "deg) scale(1.03)";
      sceneLayers.forEach(function (layer) {
        var depth = Number(layer.getAttribute("data-depth")) || 1;
        layer.style.transform = "translate3d(" + (-x * 20 * depth) + "px," + (-y * 14 * depth) + "px,0)";
      });
    });
    parallaxScene.addEventListener("pointerleave", function () {
      landscapeArt.style.transform = "";
      sceneLayers.forEach(function (layer) { layer.style.transform = ""; });
    });
  }

  // WebGL-baggrunden er lille, transparent og tegnes kun, mens den er synlig.
  document.querySelectorAll("[data-warp-canvas]").forEach(function (canvas) {
    var gl = canvas.getContext("webgl", { alpha: true, antialias: false, powerPreference: "low-power" });
    if (!gl) return;

    var vertexSource = "attribute vec2 position; varying vec2 uv; void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }";
    var fragmentSource = [
      "precision mediump float;",
      "varying vec2 uv;",
      "uniform vec2 resolution;",
      "uniform float time;",
      "void main(){",
      "vec2 p=uv-.5; p.x*=resolution.x/max(resolution.y,1.);",
      "float t=time*.22;",
      "float wave=sin(p.x*8.0+t+sin(p.y*5.0-t))*cos(p.y*7.0-t*.7);",
      "vec3 a=vec3(.20,.42,.48); vec3 b=vec3(.75,.48,.28);",
      "float blend=smoothstep(-.9,.9,wave);",
      "vec3 color=mix(a,b,blend);",
      "gl_FragColor=vec4(color,.58);",
      "}"
    ].join("\n");
    var compile = function (type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Kunne ikke starte shader-effekten:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    var vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("Kunne ikke forbinde shader-effekten:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    var resolution = gl.getUniformLocation(program, "resolution");
    var time = gl.getUniformLocation(program, "time");
    var visible = false;
    var frame = 0;
    var startedAt = 0;
    var resize = function () {
      var bounds = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      if (visible && !reduceMotion && !document.hidden && !frame) frame = requestAnimationFrame(draw);
      else if (reduceMotion) gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    var draw = function (now) {
      frame = 0;
      if (!visible || document.hidden) return;
      if (!startedAt) startedAt = now;
      gl.uniform1f(time, reduceMotion ? 0 : (now - startedAt) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };
    var observer = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(draw);
      if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: "80px" }) : null;
    if (observer) observer.observe(canvas);
    else visible = true;
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
      else if (!document.hidden && visible && !frame) frame = requestAnimationFrame(draw);
    });
    resize();
    if (visible && !reduceMotion) frame = requestAnimationFrame(draw);
  });

  // Begrænset partikelnetværk — ingen tungt bibliotek eller uendelig canvas på små skærme.
  document.querySelectorAll("[data-particle-canvas]").forEach(function (canvas) {
    var context = canvas.getContext("2d");
    if (!context) return;
    var stage = canvas.parentElement;
    var particles = [];
    var pointer = { x: -1000, y: -1000 };
    var width = 0;
    var height = 0;
    var frame = 0;
    var visible = false;
    var color = getComputedStyle(stage).color;
    var resize = function () {
      var bounds = stage.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: Math.min(52, Math.round(width / 8)) }, function () {
        return { x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28 };
      });
      if (visible && reduceMotion) draw();
      else if (visible && !frame) frame = requestAnimationFrame(draw);
    };
    var draw = function () {
      frame = 0;
      if (!visible || document.hidden) return;
      context.clearRect(0, 0, width, height);
      particles.forEach(function (point, index) {
        var dx = point.x - pointer.x;
        var dy = point.y - pointer.y;
        var distanceToPointer = Math.hypot(dx, dy);
        if (distanceToPointer < 90 && distanceToPointer > 0) {
          point.vx += dx / distanceToPointer * .025;
          point.vy += dy / distanceToPointer * .025;
        }
        point.x += point.vx;
        point.y += point.vy;
        point.vx *= .99;
        point.vy *= .99;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
        context.beginPath();
        context.arc(point.x, point.y, 2, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
        for (var other = index + 1; other < particles.length; other++) {
          var next = particles[other];
          var distance = Math.hypot(point.x - next.x, point.y - next.y);
          if (distance < 74) {
            context.globalAlpha = (1 - distance / 74) * .35;
            context.strokeStyle = color;
            context.lineWidth = .8;
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(next.x, next.y);
            context.stroke();
          }
        }
      });
      context.globalAlpha = 1;
      if (pointer.x > -1000) {
        context.beginPath();
        context.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2);
        context.fillStyle = "#fff";
        context.fill();
      }
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    };
    stage.addEventListener("pointermove", function (event) {
      var bounds = stage.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      if (visible && !frame) frame = requestAnimationFrame(draw);
    });
    stage.addEventListener("pointerdown", function (event) {
      var bounds = stage.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      if (visible && !frame) frame = requestAnimationFrame(draw);
    });
    stage.addEventListener("pointerleave", function () {
      pointer.x = -1000;
      pointer.y = -1000;
      if (visible && reduceMotion) draw();
    });
    var observer = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(draw);
      if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: "80px" }) : null;
    if (observer) observer.observe(canvas);
    else visible = true;
    window.addEventListener("resize", resize, { passive: true });
    resize();
  });

  // Tegn et abstrakt portræt om til farvede tegn; kildemotivet genereres lokalt.
  document.querySelectorAll("[data-text-portrait]").forEach(function (canvas) {
    var context = canvas.getContext("2d");
    if (!context) return;
    var source = document.createElement("canvas");
    source.width = 280;
    source.height = 160;
    var sourceContext = source.getContext("2d");
    if (!sourceContext) return;
    var gradient = sourceContext.createLinearGradient(0, 0, 280, 160);
    gradient.addColorStop(0, "#2f5d73");
    gradient.addColorStop(1, "#f0b44c");
    sourceContext.fillStyle = gradient;
    sourceContext.beginPath();
    sourceContext.ellipse(140, 82, 57, 72, 0, 0, Math.PI * 2);
    sourceContext.fill();
    sourceContext.fillStyle = "rgba(31,42,51,.76)";
    sourceContext.beginPath();
    sourceContext.moveTo(83, 80);
    sourceContext.quadraticCurveTo(82, 2, 142, 15);
    sourceContext.quadraticCurveTo(201, 14, 198, 81);
    sourceContext.quadraticCurveTo(174, 54, 149, 45);
    sourceContext.quadraticCurveTo(121, 75, 83, 80);
    sourceContext.fill();
    sourceContext.fillStyle = "rgba(255,255,255,.8)";
    sourceContext.beginPath();
    sourceContext.arc(121, 88, 4, 0, Math.PI * 2);
    sourceContext.arc(158, 88, 4, 0, Math.PI * 2);
    sourceContext.fill();
    sourceContext.strokeStyle = "rgba(31,42,51,.72)";
    sourceContext.lineWidth = 3;
    sourceContext.beginPath();
    sourceContext.arc(140, 96, 20, .25, Math.PI - .25);
    sourceContext.stroke();
    var pixels = sourceContext.getImageData(0, 0, source.width, source.height).data;
    var chars = " .,:-=+*#%@";
    var columns = 35;
    var rows = 16;
    var cellWidth = source.width / columns;
    var cellHeight = source.height / rows;
    var render = function () {
      var bounds = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var width = Math.max(1, Math.round(bounds.width * dpr));
      var height = Math.max(1, Math.round(bounds.height * dpr));
      canvas.width = width;
      canvas.height = height;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width / dpr, height / dpr);
      var scale = Math.min(bounds.width / source.width, bounds.height / source.height);
      var offsetX = (bounds.width - source.width * scale) / 2;
      var offsetY = (bounds.height - source.height * scale) / 2;
      context.font = Math.max(5, cellHeight * scale * .9) + "px monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      for (var row = 0; row < rows; row++) {
        for (var column = 0; column < columns; column++) {
          var pixel = (Math.floor((row + .5) * cellHeight) * source.width + Math.floor((column + .5) * cellWidth)) * 4;
          if (pixels[pixel + 3] < 40) continue;
          var brightness = (pixels[pixel] + pixels[pixel + 1] + pixels[pixel + 2]) / 3;
          var character = chars[Math.floor(brightness / 256 * (chars.length - 1))];
          if (character === " ") continue;
          context.fillStyle = "rgb(" + pixels[pixel] + "," + pixels[pixel + 1] + "," + pixels[pixel + 2] + ")";
          context.fillText(character, offsetX + (column + .5) * cellWidth * scale, offsetY + (row + .5) * cellHeight * scale);
        }
      }
    };
    render();
    window.addEventListener("resize", render, { passive: true });
  });

  // Vejrkortets animation er lokal og styres af en enkel, forudsigelig tilstandscyklus.
  var weatherNames = { sun: "Solskin", rain: "Regn", wind: "Blæst", snow: "Sne", storm: "Torden" };
  document.querySelectorAll("[data-weather-toggle]").forEach(function (button) {
    var stage = button.closest(".weather-stage");
    var states = ["sun", "rain", "wind", "snow", "storm"];
    button.addEventListener("click", function () {
      var index = states.indexOf(stage.getAttribute("data-weather"));
      var next = states[(index + 1) % states.length];
      stage.setAttribute("data-weather", next);
      stage.querySelector("[data-weather-label]").textContent = weatherNames[next];
      stage.querySelector(".weather-art").setAttribute("aria-label", "Vejrikon: " + weatherNames[next]);
      button.setAttribute("aria-label", "Skift vejr. Nuværende vejr: " + weatherNames[next]);
    });
  });

  // Galleriets filtre og kort kan betjenes med både mus og tastatur.
  document.querySelectorAll("[data-gallery-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      var gallery = button.closest(".experiment-gallery");
      var filter = button.getAttribute("data-gallery-filter");
      gallery.querySelectorAll("[data-gallery-filter]").forEach(function (filterButton) {
        var active = filterButton === button;
        filterButton.classList.toggle("is-active", active);
        filterButton.setAttribute("aria-pressed", String(active));
      });
      gallery.querySelectorAll(".gallery-tile").forEach(function (tile) {
        tile.hidden = filter !== "all" && tile.getAttribute("data-category") !== filter;
      });
      gallery.querySelector("[data-gallery-detail]").textContent = "Vælg et kort for at læse mere.";
    });
  });
  document.querySelectorAll(".gallery-tile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      tile.closest(".experiment-gallery").querySelector("[data-gallery-detail]").textContent = tile.getAttribute("data-detail");
    });
  });

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
