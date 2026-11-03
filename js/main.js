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
      if (window.innerWidth > 1180 && links.classList.contains("open")) {
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

  // Musik fra Last.fm. api/lastfm.ashx henter data på serveren, så API-nøglen forbliver hemmelig.
  // Python-serveren kan ikke køre ASP.NET, så lokalt vises eksempeldata i stedet.
  var musik = document.querySelector("[data-musik]");
  if (musik && window.fetch) {
    var lokal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    var kilde = lokal ? "api/lastfm-eksempel.json" : "api/lastfm.ashx";
    var nuKort = musik.querySelector("[data-nu]");
    var liste = musik.querySelector("[data-spor]");
    var pille = document.querySelector("[data-nu-pill]");
    var menupunkt = document.querySelector("[data-musik-link]");
    var sidst = "";
    var node = "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/></svg>";
    var harRtf = window.Intl && Intl.RelativeTimeFormat;
    var rtf = harRtf ? new Intl.RelativeTimeFormat("da", { numeric: "auto" }) : null;
    var rtfKort = harRtf ? new Intl.RelativeTimeFormat("da", { numeric: "auto", style: "short" }) : null;

    // "for 5 minutter siden", "i går" osv. Med kort = true: "for 5 min. siden"
    var siden = function (tid, kort) {
      var fmt = kort ? rtfKort : rtf;
      var f = function (n, enhed, forkortelse) { return fmt ? fmt.format(-n, enhed) : n + " " + forkortelse + " siden"; };
      var min = Math.floor((Date.now() / 1000 - tid) / 60);
      if (min < 1) return "lige nu";
      if (min < 60) return f(min, "minute", "min.");
      var timer = Math.floor(min / 60);
      if (timer < 24) return f(timer, "hour", "t.");
      var dage = Math.floor(timer / 24);
      if (dage < 7) return f(dage, "day", "d.");
      return "d. " + new Date(tid * 1000).toLocaleDateString("da-DK", { day: "numeric", month: "short" });
    };

    var el = function (tag, klasse, tekst) {
      var e = document.createElement(tag);
      if (klasse) e.className = klasse;
      if (tekst) e.textContent = tekst;
      return e;
    };

    var omslag = function (src) {
      var c = el("span", "cover");
      c.innerHTML = node;
      if (/^https:\/\//.test(src)) {
        var img = new Image();
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.onerror = function () { img.remove(); };
        img.src = src;
        c.appendChild(img);
      }
      return c;
    };

    // Link kun til Last.fm selv, aldrig til hvad som helst der måtte stå i data
    var link = function (spor) {
      if (!/^https:\/\/www\.last\.fm\//.test(spor.url)) return el("div");
      var a = el("a");
      a.href = spor.url;
      a.rel = "noopener";
      return a;
    };

    var tidspunkt = function (spor) {
      var t = el("time");
      if (spor.nu) {
        t.textContent = "nu";
      } else {
        t.setAttribute("data-tid", spor.tid);
        t.setAttribute("data-kort", "");
        t.dateTime = new Date(spor.tid * 1000).toISOString();
        t.textContent = siden(spor.tid, true);
      }
      return t;
    };

    var opdaterTider = function () {
      musik.querySelectorAll("[data-tid]").forEach(function (t) {
        t.textContent = (t.getAttribute("data-forstavelse") || "") + siden(+t.getAttribute("data-tid"), t.hasAttribute("data-kort"));
      });
    };

    var vis = function (data) {
      var spor = data && data.spor;
      if (!spor || !spor.length) return;
      var noegle = JSON.stringify(spor);
      if (noegle === sidst) return opdaterTider();
      sidst = noegle;

      // Det store kort: det der spiller nu, eller det seneste nummer
      var f = spor[0];
      nuKort.classList.toggle("playing", !!f.nu);
      var a = link(f);
      a.appendChild(omslag(f.billede));
      var tekst = el("div");
      var status = el("p", "now-status");
      if (f.nu) {
        status.innerHTML = "<span class='eq' aria-hidden='true'><i></i><i></i><i></i></span>";
        status.appendChild(el("span", "", "Lytter lige nu"));
      } else {
        var st = el("span", "", "Sidst hørt " + siden(f.tid));
        st.setAttribute("data-tid", f.tid);
        st.setAttribute("data-forstavelse", "Sidst hørt ");
        status.appendChild(st);
      }
      tekst.appendChild(status);
      tekst.appendChild(el("h3", "", f.titel));
      tekst.appendChild(el("p", "now-artist", f.kunstner));
      if (f.album && f.album !== f.titel) tekst.appendChild(el("p", "now-album", f.album));
      a.appendChild(tekst);
      nuKort.replaceChildren(a);

      // Listen med resten
      liste.replaceChildren.apply(liste, spor.slice(1).map(function (s) {
        var li = el("li", "track");
        var r = link(s);
        var navn = el("div");
        navn.appendChild(el("strong", "", s.titel));
        navn.appendChild(el("span", "", s.kunstner));
        r.appendChild(omslag(s.billede));
        r.appendChild(navn);
        r.appendChild(tidspunkt(s));
        li.appendChild(r);
        return li;
      }));

      // Pillen i toppen vises kun, når der faktisk spiller noget
      if (pille) {
        pille.hidden = !f.nu;
        pille.querySelector("[data-nu-pill-titel]").textContent = f.titel;
        pille.querySelector("[data-nu-pill-kunstner]").textContent = f.kunstner;
      }

      musik.hidden = false;
      if (menupunkt) menupunkt.hidden = false;
    };

    var hent = function () {
      fetch(kilde, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(vis)
        .catch(function () {}); // Går det galt, forbliver sektionen bare skjult
    };

    hent();
    setInterval(function () { if (!document.hidden) hent(); }, 30000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) hent(); });
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

  // Live vejr-widget — søg en by og hent rigtige data fra Open-Meteo (ingen API-nøgle nødvendig)
  var weatherInput = document.querySelector("[data-weather-input]");
  var weatherResults = document.querySelector("[data-weather-results]");
  var weatherStatus = document.querySelector("[data-weather-status]");
  var weatherResult = document.querySelector("[data-weather-result]");
  if (weatherInput && weatherResults && weatherStatus && weatherResult) {
    var weatherIcon = document.querySelector("[data-weather-icon]");
    var weatherTemp = document.querySelector("[data-weather-temp]");
    var weatherPlace = document.querySelector("[data-weather-place]");
    var weatherDescription = document.querySelector("[data-weather-description]");
    var weatherWind = document.querySelector("[data-weather-wind]");
    var weatherUpdated = document.querySelector("[data-weather-updated]");

    var WEATHER_STORAGE_KEY = "weather-widget-city";
    var DEFAULT_CITY = { name: "Aarhus", admin1: "", country: "Danmark", latitude: 56.1496, longitude: 10.2134 };

    // WMO-vejrkoder (bruges af Open-Meteo) oversat til dansk beskrivelse + symbol
    var WMO_CODES = {
      0: ["Klar himmel", "☀"], 1: ["Mest klart", "🌤"], 2: ["Delvist skyet", "⛅"], 3: ["Overskyet", "☁"],
      45: ["Tåge", "🌫"], 48: ["Rimtåge", "🌫"],
      51: ["Let støvregn", "🌦"], 53: ["Støvregn", "🌦"], 55: ["Tæt støvregn", "🌧"],
      56: ["Let underkølet støvregn", "🌧"], 57: ["Tæt underkølet støvregn", "🌧"],
      61: ["Let regn", "🌦"], 63: ["Regn", "🌧"], 65: ["Kraftig regn", "🌧"],
      66: ["Let underkølet regn", "🌧"], 67: ["Kraftig underkølet regn", "🌧"],
      71: ["Let snefald", "🌨"], 73: ["Snefald", "🌨"], 75: ["Kraftigt snefald", "❄"], 77: ["Snekorn", "❄"],
      80: ["Lette regnbyger", "🌦"], 81: ["Regnbyger", "🌧"], 82: ["Voldsomme regnbyger", "⛈"],
      85: ["Lette snebyger", "🌨"], 86: ["Kraftige snebyger", "❄"],
      95: ["Tordenvejr", "⛈"], 96: ["Tordenvejr med let hagl", "⛈"], 99: ["Tordenvejr med kraftig hagl", "⛈"]
    };
    function describeWeather(code) {
      return WMO_CODES[code] || ["Ukendt vejr", "🌡"];
    }
    function cityLabel(city) {
      var extra = [city.admin1, city.country].filter(Boolean).join(", ");
      return extra ? city.name + " (" + extra + ")" : city.name;
    }

    var geocodeController = null;
    var geocodeTimer = null;
    var weatherActiveIndex = -1;
    var weatherSuggestions = [];

    function hideWeatherResults() {
      weatherResults.hidden = true;
      weatherResults.replaceChildren();
      weatherInput.setAttribute("aria-expanded", "false");
      weatherInput.removeAttribute("aria-activedescendant");
      weatherActiveIndex = -1;
      weatherSuggestions = [];
    }

    function renderWeatherSuggestions(cities) {
      weatherResults.replaceChildren();
      weatherSuggestions = cities;
      weatherActiveIndex = -1;
      cities.forEach(function (city, index) {
        var option = document.createElement("button");
        option.type = "button";
        option.id = "weather-suggestion-" + index;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", "false");
        option.textContent = city.name;
        var extra = [city.admin1, city.country].filter(Boolean).join(", ");
        if (extra) {
          var span = document.createElement("span");
          span.textContent = extra;
          option.appendChild(span);
        }
        option.addEventListener("click", function () { selectWeatherCity(city); });
        weatherResults.appendChild(option);
      });
      weatherResults.hidden = cities.length === 0;
      weatherInput.setAttribute("aria-expanded", String(cities.length > 0));
    }

    function searchCities(query) {
      if (geocodeController) geocodeController.abort();
      geocodeController = ("AbortController" in window) ? new AbortController() : null;
      var url = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(query) +
        "&count=8&language=da&format=json";
      fetch(url, geocodeController ? { signal: geocodeController.signal } : undefined)
        .then(function (response) {
          if (!response.ok) throw new Error("geocoding-fejl");
          return response.json();
        })
        .then(function (data) {
          var cities = (data.results || []).map(function (result) {
            return {
              name: result.name,
              admin1: result.admin1 || "",
              country: result.country || "",
              latitude: result.latitude,
              longitude: result.longitude
            };
          });
          if (cities.length === 0) {
            hideWeatherResults();
            weatherStatus.textContent = "Ingen byer matcher \"" + query + "\".";
            return;
          }
          renderWeatherSuggestions(cities);
          weatherStatus.textContent = cities.length + " forslag fundet.";
        })
        .catch(function (error) {
          if (error.name === "AbortError") return;
          hideWeatherResults();
          weatherStatus.textContent = "Kunne ikke søge byer lige nu. Prøv igen om lidt.";
        });
    }

    weatherInput.addEventListener("input", function () {
      var query = weatherInput.value.trim();
      window.clearTimeout(geocodeTimer);
      if (query.length < 2) {
        hideWeatherResults();
        weatherStatus.textContent = "Skriv mindst 2 bogstaver for at se forslag.";
        return;
      }
      weatherStatus.textContent = "Søger …";
      geocodeTimer = window.setTimeout(function () { searchCities(query); }, 350);
    });

    weatherInput.addEventListener("keydown", function (event) {
      var options = weatherResults.querySelectorAll('[role="option"]');
      if (!options.length) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        weatherActiveIndex = event.key === "ArrowDown" ?
          Math.min(weatherActiveIndex + 1, options.length - 1) :
          Math.max(weatherActiveIndex - 1, 0);
        options.forEach(function (option, index) {
          option.setAttribute("aria-selected", String(index === weatherActiveIndex));
        });
        weatherInput.setAttribute("aria-activedescendant", options[weatherActiveIndex].id);
        options[weatherActiveIndex].scrollIntoView({ block: "nearest" });
      } else if (event.key === "Enter") {
        if (weatherActiveIndex >= 0 && weatherSuggestions[weatherActiveIndex]) {
          event.preventDefault();
          selectWeatherCity(weatherSuggestions[weatherActiveIndex]);
        }
      } else if (event.key === "Escape") {
        hideWeatherResults();
      }
    });

    weatherInput.addEventListener("blur", function () {
      window.setTimeout(hideWeatherResults, 120);
    });

    function fetchCurrentWeather(city) {
      weatherResult.classList.add("is-loading");
      weatherStatus.textContent = "Henter vejret for " + cityLabel(city) + " …";
      var url = "https://api.open-meteo.com/v1/forecast?latitude=" + city.latitude +
        "&longitude=" + city.longitude + "&current_weather=true&timezone=auto";
      fetch(url)
        .then(function (response) {
          if (!response.ok) throw new Error("vejr-fejl");
          return response.json();
        })
        .then(function (data) {
          var current = data.current_weather;
          if (!current) throw new Error("ingen data");
          var weather = describeWeather(current.weathercode);
          weatherIcon.textContent = weather[1];
          weatherTemp.textContent = Math.round(current.temperature) + "°C";
          weatherPlace.textContent = cityLabel(city);
          weatherDescription.textContent = weather[0];
          weatherWind.textContent = "Vind: " + Math.round(current.windspeed) + " km/t";
          var updated = new Date(current.time);
          weatherUpdated.textContent = "Opdateret kl. " +
            updated.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
          weatherStatus.textContent = "Vejret for " + cityLabel(city) + " er opdateret.";
        })
        .catch(function () {
          weatherStatus.textContent = "Kunne ikke hente vejrdata for " + cityLabel(city) + " lige nu. Prøv igen om lidt.";
        })
        .then(function () { weatherResult.classList.remove("is-loading"); });
    }

    function selectWeatherCity(city) {
      weatherInput.value = city.name;
      hideWeatherResults();
      fetchCurrentWeather(city);
      try { localStorage.setItem(WEATHER_STORAGE_KEY, JSON.stringify(city)); } catch (e) {}
    }

    var savedCity = null;
    try {
      var raw = localStorage.getItem(WEATHER_STORAGE_KEY);
      if (raw) savedCity = JSON.parse(raw);
    } catch (e) {}
    var startCity = (savedCity && savedCity.latitude && savedCity.longitude) ? savedCity : DEFAULT_CITY;
    weatherInput.value = startCity.name;
    fetchCurrentWeather(startCity);
  }

  // Print-knap på CV
  var printBtn = document.querySelector("[data-print]");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
})();
