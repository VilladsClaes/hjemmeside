(function () {
  "use strict";

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (finePointer.matches) {
    var cursor = document.querySelector(".custom-cursor");
    var cursorRing = document.querySelector(".custom-cursor-ring");
    if (cursor && cursorRing) {
      var cursorReady = false;
      document.addEventListener("pointermove", function (event) {
        var position = "translate3d(" + event.clientX + "px," + event.clientY + "px,0) translate(-50%,-50%)";
        cursor.style.transform = position;
        cursorRing.style.transform = position;
        if (!cursorReady) {
          document.body.classList.add("has-custom-cursor");
          cursorReady = true;
        }
      });
      document.querySelectorAll(".demo-cursor .hover-target").forEach(function (target) {
        target.addEventListener("pointerenter", function () {
          cursor.classList.add("is-hovering");
          cursorRing.classList.add("is-hovering");
        });
        target.addEventListener("pointerleave", function () {
          cursor.classList.remove("is-hovering");
          cursorRing.classList.remove("is-hovering");
        });
      });
      window.addEventListener("blur", function () {
        document.body.classList.remove("has-custom-cursor");
        cursorReady = false;
      });
      document.addEventListener("pointerout", function (event) {
        if (event.relatedTarget === null) {
          document.body.classList.remove("has-custom-cursor");
          cursorReady = false;
        }
      });
    }
  }

  document.querySelectorAll(".direction-link").forEach(function (link) {
    link.addEventListener("pointerenter", function (event) {
      var rect = link.getBoundingClientRect();
      var fromLeft = event.clientX < rect.left + rect.width / 2;
      link.style.setProperty("--underline-x", fromLeft ? "0%" : "100%");
    });
  });

  var wave = document.querySelector(".weight-wave");
  if (wave) {
    var letters = Array.from(wave.textContent);
    wave.textContent = "";
    letters.forEach(function (letter, index) {
      var span = document.createElement("span");
      span.textContent = letter === " " ? "\u00a0" : letter;
      span.style.setProperty("--wave-delay", (index * -0.12) + "s");
      wave.appendChild(span);
    });
  }

  var roomPreview = document.querySelector(".room-preview");
  document.querySelectorAll("[data-room-choice]").forEach(function (button) {
    function selectRoom() {
      var room = button.dataset.roomChoice;
      roomPreview.dataset.room = room;
      roomPreview.setAttribute("aria-label", "Farvesat rum, scene " + room + " af 3");
      document.querySelectorAll("[data-room-choice]").forEach(function (choice) {
        choice.setAttribute("aria-pressed", String(choice === button));
      });
    }
    button.addEventListener("click", selectRoom);
    button.addEventListener("pointerenter", selectRoom);
  });

  var shapeNames = ["Nysgerrighed", "Samarbejde", "Læring", "Kreativitet"];
  var shapeElements = document.querySelectorAll(".shape-stage .shape");
  document.querySelectorAll("[data-shape-choice]").forEach(function (button) {
    function selectShape() {
      var index = Number(button.dataset.shapeChoice);
      shapeElements.forEach(function (shape, shapeIndex) {
        shape.classList.toggle("shape-active", shapeIndex === index);
      });
      document.querySelectorAll("[data-shape-choice]").forEach(function (choice) {
        choice.setAttribute("aria-pressed", String(choice === button));
      });
      var svg = document.querySelector(".shape-stage");
      svg.setAttribute("aria-label", shapeNames[index] + ", vist som " + ["en cirkel", "et kvadrat", "en trekant", "en diamant"][index]);
    }
    button.addEventListener("click", selectShape);
    button.addEventListener("pointerenter", selectShape);
  });

  var slides = [
    { name: "Fjordlys", label: "Fjordlys" },
    { name: "Skovro", label: "Skovro" },
    { name: "Aftenhimmel", label: "Aftenhimmel" }
  ];
  var sliderScene = document.querySelector(".slider-scene");
  var currentSlide = 0;
  document.querySelectorAll("[data-slide-step]").forEach(function (button) {
    button.addEventListener("click", function () {
      currentSlide = (currentSlide + Number(button.dataset.slideStep) + slides.length) % slides.length;
      sliderScene.dataset.slide = String(currentSlide);
      sliderScene.setAttribute("aria-label", "Scene " + (currentSlide + 1) + " af " + slides.length + ": " + slides[currentSlide].name);
      sliderScene.querySelector(".slider-caption").textContent = slides[currentSlide].label;
      document.querySelector(".slide-count").textContent = String(currentSlide + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
      sliderScene.classList.remove("is-changing");
      void sliderScene.offsetWidth;
      sliderScene.classList.add("is-changing");
    });
  });

  var canvas = document.querySelector(".mosaic-canvas");
  var mosaicButton = document.querySelector(".mosaic-button");
  var mosaicStatus = document.querySelector(".canvas-status");
  if (canvas && mosaicButton) {
    var context = canvas.getContext("2d");
    if (!context) {
      mosaicStatus.textContent = "Canvas understøttes ikke i denne browser.";
      mosaicButton.disabled = true;
    } else {
      var art = document.createElement("canvas");
      art.width = canvas.width;
      art.height = canvas.height;
      var artContext = art.getContext("2d");
      var gradient = artContext.createLinearGradient(0, 0, art.width, art.height);
      gradient.addColorStop(0, "#244d5c");
      gradient.addColorStop(.48, "#7e9d83");
      gradient.addColorStop(1, "#f0b44c");
      artContext.fillStyle = gradient;
      artContext.fillRect(0, 0, art.width, art.height);
      artContext.fillStyle = "rgba(255,255,255,.3)";
      artContext.beginPath();
      artContext.arc(365, 77, 42, 0, Math.PI * 2);
      artContext.fill();
      artContext.fillStyle = "rgba(19,42,51,.42)";
      artContext.beginPath();
      artContext.moveTo(0, 220);
      artContext.quadraticCurveTo(105, 142, 230, 218);
      artContext.quadraticCurveTo(340, 136, 480, 203);
      artContext.lineTo(480, 260);
      artContext.lineTo(0, 260);
      artContext.fill();
      artContext.fillStyle = "rgba(255,255,255,.8)";
      artContext.font = "500 32px Georgia";
      artContext.fillText("Find din egen vej", 24, 52);

      var columns = 20;
      var rows = 11;
      var tileWidth = canvas.width / columns;
      var tileHeight = canvas.height / rows;
      var tileColors = [];
      for (var row = 0; row < rows; row++) {
        for (var col = 0; col < columns; col++) {
          var sample = artContext.getImageData(Math.floor((col + .5) * tileWidth), Math.floor((row + .5) * tileHeight), 1, 1).data;
          tileColors.push("rgba(" + sample[0] + "," + sample[1] + "," + sample[2] + ",.96)");
        }
      }
      function drawFinishedMosaic() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(art, 0, 0);
      }
      drawFinishedMosaic();
      var animationFrame = 0;
      mosaicButton.addEventListener("click", function () {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          drawFinishedMosaic();
          mosaicStatus.textContent = "Mosaikken er samlet.";
          return;
        }
        window.cancelAnimationFrame(animationFrame);
        context.drawImage(art, 0, 0);
        var order = Array.from({ length: columns * rows }, function (_, index) { return index; });
        for (var i = order.length - 1; i > 0; i--) {
          var swap = Math.floor(Math.random() * (i + 1));
          var temporary = order[i];
          order[i] = order[swap];
          order[swap] = temporary;
        }
        var revealed = 0;
        function revealTiles() {
          var end = Math.min(revealed + 12, order.length);
          for (; revealed < end; revealed++) {
            var tile = order[revealed];
            context.fillStyle = tileColors[tile];
            context.fillRect((tile % columns) * tileWidth, Math.floor(tile / columns) * tileHeight, tileWidth, tileHeight);
          }
          mosaicStatus.textContent = revealed === order.length ? "Mosaikken er samlet." : "Samler mosaik …";
          if (revealed < order.length) animationFrame = window.requestAnimationFrame(revealTiles);
        }
        mosaicStatus.textContent = "Samler mosaik …";
        revealTiles();
      });
    }
  }

  var citySlider = document.querySelector(".city-slider");
  var cityRotate = document.querySelector(".city-rotate");
  if (citySlider && cityRotate) {
    citySlider.addEventListener("input", function () {
      cityRotate.style.setProperty("--city-rotation", citySlider.value + "deg");
    });
  }

  function numberInDanish(value) {
    var ones = ["nul", "en", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni", "ti", "elleve", "tolv", "tretten", "fjorten", "femten", "seksten", "sytten", "atten", "nitten"];
    var tens = ["", "", "tyve", "tredive", "fyrre", "halvtreds"];
    if (value < 20) return ones[value];
    var ten = Math.floor(value / 10);
    var one = value % 10;
    if (ten === 2 && one > 0) return ones[one] + "ogtyve";
    if (one > 0) return ones[one] + "og" + tens[ten];
    return tens[ten];
  }
  var wordClock = document.querySelector(".word-clock");
  var clockDigits = document.querySelector(".clock-digits");
  function updateClock() {
    var now = new Date();
    var hour = now.getHours() % 12 || 12;
    var minute = now.getMinutes();
    wordClock.textContent = "Klokken er " + numberInDanish(hour) + " og " + numberInDanish(minute);
    clockDigits.textContent = String(now.getHours()).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
  }
  updateClock();
  window.setInterval(updateClock, 1000);

  document.querySelectorAll(".profile-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      var details = document.getElementById(button.getAttribute("aria-controls"));
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.textContent = expanded ? "Vis detaljer" : "Skjul detaljer";
      details.hidden = expanded;
    });
  });

  document.querySelectorAll(".ticket").forEach(function (ticket) {
    ticket.addEventListener("click", function () {
      var expanded = ticket.getAttribute("aria-expanded") === "true";
      ticket.setAttribute("aria-expanded", String(!expanded));
      ticket.querySelector(".ticket-detail").hidden = expanded;
    });
  });

  document.querySelectorAll(".tilt-card").forEach(function (card) {
    function resetTilt() {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    }
    card.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var rect = card.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - .5;
      var y = (event.clientY - rect.top) / rect.height - .5;
      card.style.setProperty("--tilt-x", (-y * 8).toFixed(2) + "deg");
      card.style.setProperty("--tilt-y", (x * 10).toFixed(2) + "deg");
    });
    card.addEventListener("pointerleave", resetTilt);
    card.querySelector(".tilt-reset").addEventListener("click", resetTilt);
  });

  var dialog = document.querySelector(".laser-dialog");
  var openDialog = document.querySelector(".modal-open");
  if (dialog && openDialog) {
    var closeDialog = function () {
      if (typeof dialog.close === "function" && dialog.open) dialog.close();
      else dialog.removeAttribute("open");
      openDialog.focus();
    };
    openDialog.addEventListener("click", function () {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      dialog.querySelector(".dialog-close").focus();
    });
    dialog.querySelector(".dialog-close").addEventListener("click", closeDialog);
    dialog.querySelector(".dialog-done").addEventListener("click", closeDialog);
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeDialog();
    });
  }

  var audioButton = document.querySelector(".audio-toggle");
  var volumeSlider = document.querySelector(".volume-slider");
  var audioStatus = document.querySelector(".audio-status");
  if (audioButton && volumeSlider) {
    var AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    var audioContext;
    var oscillator;
    var gain;
    var toneStarted = false;
    function stopTone() {
      if (oscillator) {
        if (toneStarted) oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
        toneStarted = false;
      }
      audioButton.setAttribute("aria-pressed", "false");
      audioButton.setAttribute("aria-label", "Afspil den syntetiske tone");
      audioButton.firstElementChild.textContent = "▶";
      audioStatus.textContent = "Tryk for at starte";
    }
    if (!AudioContextConstructor) {
      audioButton.disabled = true;
      audioStatus.textContent = "Lyd understøttes ikke i denne browser.";
    } else {
      audioButton.addEventListener("click", function () {
        if (oscillator) {
          stopTone();
          return;
        }
        try {
          audioContext = audioContext || new AudioContextConstructor();
          if (audioContext.state === "suspended") audioContext.resume();
          oscillator = audioContext.createOscillator();
          gain = audioContext.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = 110;
          gain.gain.value = Number(volumeSlider.value) / 1000;
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start();
          toneStarted = true;
          audioButton.setAttribute("aria-pressed", "true");
          audioButton.setAttribute("aria-label", "Stop den syntetiske tone");
          audioButton.firstElementChild.textContent = "Ⅱ";
          audioStatus.textContent = "Afspiller — tryk for at stoppe";
        } catch (error) {
          audioStatus.textContent = "Lyd kunne ikke startes i denne browser.";
          stopTone();
        }
      });
      volumeSlider.addEventListener("input", function () {
        if (gain && audioContext) gain.gain.setTargetAtTime(Number(volumeSlider.value) / 1000, audioContext.currentTime, .04);
      });
      window.addEventListener("pagehide", stopTone);
    }
  }

  var modeCheckbox = document.querySelector(".mode-checkbox");
  var modeMessage = document.querySelector(".mode-message");
  if (modeCheckbox && modeMessage) {
    modeCheckbox.addEventListener("change", function () {
      modeCheckbox.setAttribute("aria-checked", String(modeCheckbox.checked));
      modeMessage.textContent = modeCheckbox.checked ? "Fokus på — én ting ad gangen." : "Klar til nye idéer.";
    });
  }

  var storyPages = [
    {
      kicker: "01 · Nysgerrighed",
      title: "Det begynder med et godt spørgsmål.",
      body: "Man behøver ikke kende alle svarene for at tage det første skridt."
    },
    {
      kicker: "02 · Samarbejde",
      title: "Flere blikke ser flere muligheder.",
      body: "Når vi deler idéer, kan en lille tanke vokse sig større."
    },
    {
      kicker: "03 · Handling",
      title: "Så bliver idéen til noget, der virker.",
      body: "Vi prøver, lytter og gør løsningen bedre undervejs."
    }
  ];
  var storySlide = document.querySelector(".story-slide");
  var storyIndex = 0;
  document.querySelectorAll("[data-story-step]").forEach(function (button) {
    button.addEventListener("click", function () {
      storyIndex = (storyIndex + Number(button.dataset.storyStep) + storyPages.length) % storyPages.length;
      var page = storyPages[storyIndex];
      storySlide.dataset.storyIndex = String(storyIndex);
      storySlide.querySelector(".story-kicker").textContent = page.kicker;
      storySlide.querySelector("h4").textContent = page.title;
      storySlide.querySelector("p").textContent = page.body;
      document.querySelector(".story-count").textContent = String(storyIndex + 1).padStart(2, "0") + " / " + String(storyPages.length).padStart(2, "0");
      storySlide.classList.remove("is-changing");
      void storySlide.offsetWidth;
      storySlide.classList.add("is-changing");
    });
  });

  var clipScene = document.querySelector(".clip-scene");
  var clipTitles = ["En idé tager form", "Vi bygger sammen", "Noget andre kan bruge"];
  var clipIndex = 0;
  document.querySelectorAll("[data-clip-step]").forEach(function (button) {
    button.addEventListener("click", function () {
      clipIndex = (clipIndex + Number(button.dataset.clipStep) + clipTitles.length) % clipTitles.length;
      clipScene.dataset.clipScene = String(clipIndex);
      clipScene.querySelector(".clip-index").textContent = String(clipIndex + 1).padStart(2, "0");
      clipScene.querySelector("strong").textContent = clipTitles[clipIndex];
      document.querySelector(".clip-count").textContent = String(clipIndex + 1).padStart(2, "0") + " / " + String(clipTitles.length).padStart(2, "0");
      clipScene.classList.remove("is-changing");
      void clipScene.offsetWidth;
      clipScene.classList.add("is-changing");
    });
  });

  var layerScene = document.querySelector(".layer-scene");
  var layerDescriptions = ["Roligt fjordlandskab", "Grøn skov med blødt lys", "Varmt aftenlys over byen"];
  document.querySelectorAll("[data-layer-choice]").forEach(function (button) {
    function chooseLayer() {
      var choice = Number(button.dataset.layerChoice);
      layerScene.dataset.layerScene = String(choice);
      layerScene.setAttribute("aria-label", layerDescriptions[choice]);
      layerScene.classList.remove("is-switching");
      void layerScene.offsetWidth;
      layerScene.classList.add("is-switching");
      document.querySelectorAll("[data-layer-choice]").forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });
    }
    button.addEventListener("click", chooseLayer);
    button.addEventListener("pointerenter", function (event) {
      if (event.pointerType === "mouse") chooseLayer();
    });
  });

  document.querySelectorAll(".deck-card button").forEach(function (button) {
    button.addEventListener("click", function () {
      var card = button.closest(".deck-card");
      var details = card.querySelector(".deck-detail");
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.textContent = expanded ? "Vis mere" : "Vis mindre";
      details.hidden = expanded;
      card.classList.toggle("is-expanded", !expanded);
    });
  });

  var imageInput = document.querySelector(".image-file");
  var uploadPreview = document.querySelector(".upload-preview");
  var uploadImage = document.querySelector(".upload-image");
  var uploadStatus = document.querySelector(".upload-status");
  var uploadDrop = document.querySelector(".upload-drop");
  var uploadClear = document.querySelector(".upload-clear");
  if (imageInput && uploadPreview && uploadImage && uploadStatus && uploadDrop) {
    var previewUrl = null;
    function clearImage() {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        previewUrl = null;
      }
      uploadImage.removeAttribute("src");
      uploadPreview.hidden = true;
      imageInput.value = "";
    }
    function loadImage(file) {
      if (!file) return;
      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
        uploadStatus.textContent = "Vælg et JPG-, PNG-, GIF- eller WebP-billede.";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        uploadStatus.textContent = "Billedet er større end grænsen på 5 MB.";
        return;
      }
      clearImage();
      previewUrl = URL.createObjectURL(file);
      uploadImage.onload = function () {
        uploadPreview.hidden = false;
        uploadStatus.textContent = file.name + " — vises kun lokalt i din browser.";
      };
      uploadImage.onerror = function () {
        clearImage();
        uploadStatus.textContent = "Filen kunne ikke læses som et billede.";
      };
      uploadImage.src = previewUrl;
    }
    imageInput.addEventListener("change", function () {
      loadImage(imageInput.files && imageInput.files[0]);
    });
    if (uploadClear) {
      uploadClear.addEventListener("click", function () {
        clearImage();
        uploadStatus.textContent = "Billedet er fjernet fra forhåndsvisningen.";
        imageInput.focus();
      });
    }
    ["dragenter", "dragover"].forEach(function (eventName) {
      uploadDrop.addEventListener(eventName, function (event) {
        event.preventDefault();
        uploadDrop.classList.add("is-dragging");
      });
    });
    ["dragleave", "drop"].forEach(function (eventName) {
      uploadDrop.addEventListener(eventName, function (event) {
        event.preventDefault();
        uploadDrop.classList.remove("is-dragging");
      });
    });
    uploadDrop.addEventListener("drop", function (event) {
      loadImage(event.dataTransfer && event.dataTransfer.files[0]);
    });
    window.addEventListener("pagehide", clearImage);
  }

  var accordionButtons = document.querySelectorAll(".profile-accordion h4 button");
  accordionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var willOpen = button.getAttribute("aria-expanded") !== "true";
      accordionButtons.forEach(function (other) {
        var panel = document.getElementById(other.getAttribute("aria-controls"));
        var isOpen = other === button && willOpen;
        other.setAttribute("aria-expanded", String(isOpen));
        panel.hidden = !isOpen;
      });
    });
  });

  var parallaxDemo = document.querySelector("[data-scroll-words]");
  if (parallaxDemo && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var parallaxFrame = 0;
    function updateParallax() {
      window.cancelAnimationFrame(parallaxFrame);
      parallaxFrame = window.requestAnimationFrame(function () {
        var rect = parallaxDemo.getBoundingClientRect();
        var distance = Math.max(-24, Math.min(24, (window.innerHeight / 2 - (rect.top + rect.height / 2)) * .08));
        parallaxDemo.style.setProperty("--scroll-one", (-12 + distance) + "px");
        parallaxDemo.style.setProperty("--scroll-two", (12 - distance * 1.35) + "px");
        parallaxDemo.style.setProperty("--scroll-three", (-8 + distance * .55) + "px");
      });
    }
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    updateParallax();
  }

  var bloom = document.querySelector(".bloom-svg");
  var bloomHue = document.querySelector(".bloom-hue");
  var bloomOutput = document.querySelector(".bloom-hue-value");
  if (bloom && bloomHue && bloomOutput) {
    var rosette = bloom.querySelector(".bloom-rosette");
    for (var petalIndex = 0; petalIndex < 24; petalIndex++) {
      var petal = document.createElementNS("http://www.w3.org/2000/svg", "use");
      petal.setAttribute("href", "#bloom-petal");
      petal.setAttribute("transform", "rotate(" + (petalIndex * 15) + " 100 100)");
      petal.style.setProperty("--petal-offset", String(petalIndex * 7));
      rosette.appendChild(petal);
    }
    function updateBloom() {
      var hue = Number(bloomHue.value);
      bloom.style.setProperty("--bloom-hue", String(hue));
      bloomOutput.textContent = hue + "°";
      bloomHue.setAttribute("aria-valuetext", hue + " graders farvetone");
    }
    bloomHue.addEventListener("input", updateBloom);
    updateBloom();
  }

  var particleCanvas = document.querySelector(".particle-canvas");
  if (particleCanvas) {
    var particleContext = particleCanvas.getContext("2d");
    if (particleContext) {
      var particleArea = particleCanvas.parentElement;
      var particleReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      var particleVisible = !("IntersectionObserver" in window);
      var particlePageVisible = !document.hidden;
      var particleFrame = 0;
      var particleWidth = 0;
      var particleHeight = 0;
      var particlePoints = [];
      var particlePointer = null;

      function resizeParticleCanvas() {
        var rect = particleCanvas.getBoundingClientRect();
        var ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        particleWidth = rect.width;
        particleHeight = rect.height;
        particleCanvas.width = Math.max(1, Math.round(particleWidth * ratio));
        particleCanvas.height = Math.max(1, Math.round(particleHeight * ratio));
        particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);
        particlePoints = Array.from({ length: 64 }, function () {
          return {
            x: Math.random() * particleWidth,
            y: Math.random() * particleHeight,
            vx: (Math.random() - .5) * .35,
            vy: (Math.random() - .5) * .35,
            size: 1 + Math.random() * 1.5
          };
        });
        drawParticles(false);
      }
      function drawParticles(animate) {
        if (!particleWidth || !particleHeight) return;
        particleContext.clearRect(0, 0, particleWidth, particleHeight);
        particlePoints.forEach(function (point) {
          if (animate) {
            if (particlePointer) {
              var dx = particlePointer.x - point.x;
              var dy = particlePointer.y - point.y;
              var distance = Math.hypot(dx, dy) || 1;
              if (distance < 170) {
                point.vx += dx / distance * .012;
                point.vy += dy / distance * .012;
              }
            }
            point.vx *= .995;
            point.vy *= .995;
            point.x += point.vx;
            point.y += point.vy;
            if (point.x < 0 || point.x > particleWidth) point.vx *= -1;
            if (point.y < 0 || point.y > particleHeight) point.vy *= -1;
            point.x = Math.max(0, Math.min(particleWidth, point.x));
            point.y = Math.max(0, Math.min(particleHeight, point.y));
          }
        });
        for (var first = 0; first < particlePoints.length; first++) {
          for (var second = first + 1; second < particlePoints.length; second++) {
            var distanceBetween = Math.hypot(particlePoints[first].x - particlePoints[second].x, particlePoints[first].y - particlePoints[second].y);
            if (distanceBetween < 82) {
              particleContext.strokeStyle = "rgba(191, 214, 203, " + ((1 - distanceBetween / 82) * .28) + ")";
              particleContext.lineWidth = .7;
              particleContext.beginPath();
              particleContext.moveTo(particlePoints[first].x, particlePoints[first].y);
              particleContext.lineTo(particlePoints[second].x, particlePoints[second].y);
              particleContext.stroke();
            }
          }
        }
        particlePoints.forEach(function (point) {
          particleContext.fillStyle = "#efc387";
          particleContext.beginPath();
          particleContext.arc(point.x, point.y, point.size, 0, Math.PI * 2);
          particleContext.fill();
        });
        if (animate && !particleReducedMotion.matches && particleVisible && particlePageVisible) {
          particleFrame = window.requestAnimationFrame(function () { drawParticles(true); });
        } else {
          particleFrame = 0;
        }
      }
      function stopParticleAnimation() {
        if (particleFrame) window.cancelAnimationFrame(particleFrame);
        particleFrame = 0;
      }
      function startParticleAnimation() {
        if (!particleReducedMotion.matches && particleVisible && particlePageVisible && !particleFrame) {
          particleFrame = window.requestAnimationFrame(function () { drawParticles(true); });
        }
      }
      particleArea.addEventListener("pointermove", function (event) {
        var rect = particleCanvas.getBoundingClientRect();
        particlePointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      });
      particleArea.addEventListener("pointerleave", function () { particlePointer = null; });
      window.addEventListener("resize", resizeParticleCanvas);
      document.addEventListener("visibilitychange", function () {
        particlePageVisible = !document.hidden;
        if (particlePageVisible) startParticleAnimation();
        else stopParticleAnimation();
      });
      particleReducedMotion.addEventListener("change", function () {
        if (particleReducedMotion.matches) {
          stopParticleAnimation();
          drawParticles(false);
        } else {
          startParticleAnimation();
        }
      });
      if ("IntersectionObserver" in window) {
        var particleObserver = new IntersectionObserver(function (entries) {
          particleVisible = entries[0].isIntersecting;
          if (particleVisible) startParticleAnimation();
          else stopParticleAnimation();
        }, { threshold: .05 });
        particleObserver.observe(particleArea);
      }
      resizeParticleCanvas();
      startParticleAnimation();
    } else {
      particleCanvas.parentElement.querySelector(".particle-status").textContent = "Canvas understøttes ikke i denne browser.";
    }
  }

  var pressButton = document.querySelector(".press-button");
  var pressButtonStatus = document.querySelector(".press-button-status");
  if (pressButton && pressButtonStatus) {
    pressButton.addEventListener("click", function () {
      pressButtonStatus.textContent = "Tak for trykket — lagene giver efter, når du klikker, trykker eller bruger Enter.";
    });
  }

  var patternPreview = document.querySelector(".pattern-preview");
  var patternForm = document.querySelector(".pattern-controls");
  if (patternPreview && patternForm) {
    var pattern = patternPreview.querySelector(".linked-circle-pattern");
    var patternSize = patternForm.querySelector(".pattern-size");
    var patternRadius = patternForm.querySelector(".pattern-radius");
    var patternStroke = patternForm.querySelector(".pattern-stroke");
    var patternColor = patternForm.querySelector(".pattern-color");
    var patternStatus = patternForm.querySelector(".pattern-status");

    function updatePattern() {
      var size = Number(patternSize.value);
      var radius = Math.min(Number(patternRadius.value), Math.floor(size * .48));
      var stroke = Number(patternStroke.value);
      var color = /^#[0-9a-f]{6}$/i.test(patternColor.value) ? patternColor.value : "#d69c69";
      pattern.setAttribute("width", String(size));
      pattern.setAttribute("height", String(size));
      patternPreview.querySelectorAll(".pattern-ring").forEach(function (ring) {
        ring.setAttribute("r", String(radius));
        ring.setAttribute("stroke-width", String(stroke));
        ring.setAttribute("stroke", color);
        ring.setAttribute("cx", String(size / 2 + Number(ring.dataset.patternX) * size / 2));
        ring.setAttribute("cy", String(size / 2 + Number(ring.dataset.patternY) * size / 2));
      });
      patternForm.querySelector(".pattern-size-value").textContent = size + " px";
      patternForm.querySelector(".pattern-radius-value").textContent = radius + " px";
      patternForm.querySelector(".pattern-stroke-value").textContent = stroke + " px";
      patternPreview.setAttribute("aria-label", "Gentaget mønster af cirkler, størrelse " + size + " pixels og radius " + radius + " pixels");
      patternStatus.textContent = "Størrelse " + size + " px · radius " + radius + " px · farve " + color;
    }
    [patternSize, patternRadius, patternStroke, patternColor].forEach(function (control) {
      control.addEventListener("input", updatePattern);
    });
    patternForm.querySelector(".pattern-download").addEventListener("click", function () {
      var exportSvg = patternPreview.cloneNode(true);
      exportSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      exportSvg.removeAttribute("class");
      exportSvg.setAttribute("width", "880");
      exportSvg.setAttribute("height", "440");
      var serialized = new XMLSerializer().serializeToString(exportSvg);
      var url = URL.createObjectURL(new Blob([serialized], { type: "image/svg+xml;charset=utf-8" }));
      var anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "cirkelflet.svg";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      patternStatus.textContent = "Dit SVG-mønster er hentet.";
    });
    updatePattern();
  }

  var emojiMaker = document.querySelector(".demo-emoji-maker");
  if (emojiMaker) {
    var emojiFacePreview = emojiMaker.querySelector(".emoji-maker-face");
    var emojiAccessoryPreview = emojiMaker.querySelector(".emoji-maker-accessory");
    var emojiMakerStatus = emojiMaker.querySelector(".emoji-maker-status");
    function updateEmojiMaker() {
      var faceChoice = emojiMaker.querySelector('input[name="emoji-face"]:checked');
      var accessoryChoice = emojiMaker.querySelector('input[name="emoji-accessory"]:checked');
      if (!faceChoice || !accessoryChoice) return;
      var faceName = faceChoice.dataset.name;
      var accessoryName = accessoryChoice.dataset.name;
      emojiFacePreview.textContent = faceChoice.value;
      emojiFacePreview.setAttribute("aria-label", faceName);
      emojiAccessoryPreview.textContent = accessoryChoice.value;
      emojiMakerStatus.textContent = faceName + (accessoryChoice.value ? " med " + accessoryName.toLocaleLowerCase("da") : " uden tilbehør") + " — klar til nye kombinationer.";
    }
    emojiMaker.addEventListener("change", updateEmojiMaker);
  }

  var ratingButtons = Array.from(document.querySelectorAll("[data-rating]"));
  var ratingStatus = document.querySelector(".rating-status");
  if (ratingButtons.length && ratingStatus) {
    var ratingDescriptions = ["meget lidt", "lidt", "en del", "meget", "masser"];
    function selectRating(selectedButton) {
      var value = Number(selectedButton.dataset.rating);
      ratingButtons.forEach(function (button) {
        button.setAttribute("aria-pressed", String(button === selectedButton));
      });
      ratingStatus.textContent = "Du valgte " + value + " af 5 — " + ratingDescriptions[value - 1] + ". Dit svar er kun her på siden.";
    }
    ratingButtons.forEach(function (button, index) {
      button.addEventListener("click", function () { selectRating(button); });
      button.addEventListener("keydown", function (event) {
        var nextIndex;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % ratingButtons.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + ratingButtons.length) % ratingButtons.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = ratingButtons.length - 1;
        else return;
        event.preventDefault();
        ratingButtons[nextIndex].focus();
        selectRating(ratingButtons[nextIndex]);
      });
    });
    document.querySelector(".rating-reset").addEventListener("click", function () {
      ratingButtons.forEach(function (button) { button.setAttribute("aria-pressed", "false"); });
      ratingStatus.textContent = "Vælg et tal — dit svar bliver kun her på siden.";
      ratingButtons[0].focus();
    });
  }

  var ctaStatus = document.querySelector(".cta-gallery-status");
  if (ctaStatus) {
    document.querySelectorAll(".cta-sample").forEach(function (button) {
      button.addEventListener("click", function () {
        ctaStatus.textContent = "“" + button.querySelector("span").textContent + "” — valgt. Bevægelsen er kun et lille signal.";
      });
    });
  }

  var liquidSlider = document.querySelector(".liquid-level");
  var liquidBottle = document.querySelector(".css-bottle");
  var liquidOutput = document.querySelector(".liquid-value");
  if (liquidSlider && liquidBottle && liquidOutput) {
    function updateLiquid() {
      var level = Number(liquidSlider.value);
      liquidBottle.style.setProperty("--liquid-level", level + "%");
      liquidOutput.value = level + " %";
      liquidOutput.textContent = level + " %";
      liquidBottle.parentElement.setAttribute("aria-label", "En blå dråbe ved siden af en flaske, fyldt " + level + " procent");
    }
    liquidSlider.addEventListener("input", updateLiquid);
    updateLiquid();
  }

  var gradientSlider = document.querySelector(".gradient-hue");
  var gradientWord = document.querySelector(".gradient-word");
  var gradientOutput = document.querySelector(".gradient-hue-value");
  if (gradientSlider && gradientWord && gradientOutput) {
    function updateGradientHue() {
      var hue = Number(gradientSlider.value);
      gradientWord.style.setProperty("--gradient-hue", hue);
      gradientOutput.value = hue + "°";
      gradientOutput.textContent = hue + "°";
    }
    gradientSlider.addEventListener("input", updateGradientHue);
    updateGradientHue();
  }

  var blendScene = document.querySelector(".blend-scene");
  var blendStatus = document.querySelector(".blend-status");
  if (blendScene && blendStatus) {
    document.querySelectorAll("[data-blend-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        var mode = button.dataset.blendChoice;
        blendScene.style.setProperty("--blend-mode", mode);
        blendScene.setAttribute("aria-label", "Abstrakt farvelandskab med " + mode + "-blanding");
        document.querySelectorAll("[data-blend-choice]").forEach(function (choice) {
          choice.setAttribute("aria-pressed", String(choice === button));
        });
        blendStatus.textContent = "Blanding: " + button.textContent;
      });
    });
  }

  var menuIconStatus = document.querySelector(".menu-icon-status");
  if (menuIconStatus) {
    document.querySelectorAll(".menu-icon-choice").forEach(function (button) {
      button.addEventListener("click", function () {
        var wasSelected = button.getAttribute("aria-pressed") === "true";
        document.querySelectorAll(".menu-icon-choice").forEach(function (choice) {
          choice.setAttribute("aria-pressed", String(choice === button && !wasSelected));
        });
        menuIconStatus.textContent = wasSelected
          ? "Ikonet er tilbage i sin udgangsform."
          : button.querySelector("span:last-child").textContent + " — vist som åben menu.";
      });
    });
  }

  var ribbonStage = document.querySelector(".ribbon-stage");
  if (ribbonStage) {
    document.querySelectorAll(".ribbon-controls [data-ribbon-tone]").forEach(function (button) {
      button.addEventListener("click", function () {
        ribbonStage.dataset.ribbonTone = button.dataset.ribbonTone;
        document.querySelectorAll("[data-ribbon-tone]").forEach(function (choice) {
          choice.setAttribute("aria-pressed", String(choice === button));
        });
      });
    });
  }

  function connectPercentSlider(selector, targetSelector, valueSelector, cssProperty, suffix) {
    var slider = document.querySelector(selector);
    var target = document.querySelector(targetSelector);
    var output = document.querySelector(valueSelector);
    if (!slider || !target || !output) return;
    function update() {
      var value = Number(slider.value);
      target.style.setProperty(cssProperty, value + "%");
      output.value = value + suffix;
      output.textContent = value + suffix;
    }
    slider.addEventListener("input", update);
    update();
  }
  connectPercentSlider(".skew-position", ".skew-scene", ".skew-value", "--skew-split", " %");
  connectPercentSlider(".comic-cut", ".comic-scene", ".comic-value", "--comic-cut", " %");

  var wineSlider = document.querySelector(".wine-fill");
  var wineGlass = document.querySelector(".wine-glass");
  var wineOutput = document.querySelector(".wine-value");
  if (wineSlider && wineGlass && wineOutput) {
    function updateWine() {
      var level = Number(wineSlider.value);
      wineGlass.style.setProperty("--wine-level", level + "%");
      wineGlass.setAttribute("aria-label", level ? "Et glas fyldt " + level + " procent" : "Et tomt, gennemsigtigt glas");
      wineOutput.value = level + " %";
      wineOutput.textContent = level + " %";
    }
    wineSlider.addEventListener("input", updateWine);
    updateWine();
  }

  var shapeGallery = document.querySelector(".shape-gallery");
  if (shapeGallery) {
    document.querySelectorAll(".gallery-layouts [data-gallery-layout]").forEach(function (button) {
      button.addEventListener("click", function () {
        var layout = button.dataset.galleryLayout;
        shapeGallery.dataset.galleryLayout = layout;
        shapeGallery.setAttribute("aria-label", "Et " + layout + " billedgitter med seks abstrakte scener");
        document.querySelectorAll(".gallery-layouts [data-gallery-layout]").forEach(function (choice) {
          choice.setAttribute("aria-pressed", String(choice === button));
        });
      });
    });
  }

  var curtainStage = document.querySelector(".overlay-menu-stage");
  if (curtainStage) {
    var curtainToggle = curtainStage.querySelector(".overlay-menu-toggle");
    var curtainPanel = curtainStage.querySelector(".overlay-menu-panel");
    var curtainClose = curtainStage.querySelector(".overlay-menu-close");
    var overlayMenuStatus = document.querySelector(".overlay-menu-status");
    function setCurtain(open, restoreFocus) {
      curtainStage.dataset.menuOpen = String(open);
      curtainToggle.setAttribute("aria-expanded", String(open));
      curtainToggle.innerHTML = open ? "Luk menu <span aria-hidden=\"true\">×</span>" : "Åbn menu <span aria-hidden=\"true\">☰</span>";
      curtainPanel.setAttribute("aria-hidden", String(!open));
      curtainPanel.inert = !open;
      overlayMenuStatus.textContent = open ? "Menuen er åben." : "Menuen er lukket.";
      if (open) curtainPanel.querySelector("a").focus();
      else if (restoreFocus) curtainToggle.focus();
    }
    curtainToggle.addEventListener("click", function () {
      setCurtain(curtainStage.dataset.menuOpen !== "true", true);
    });
    curtainClose.addEventListener("click", function () { setCurtain(false, true); });
    curtainPanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setCurtain(false, false); });
    });
    curtainStage.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && curtainStage.dataset.menuOpen === "true") {
        event.preventDefault();
        setCurtain(false, true);
      }
    });
  }

  var bottomModal = document.querySelector(".bottom-modal");
  var bottomModalOpen = document.querySelector(".bottom-modal-open");
  if (bottomModal && bottomModalOpen) {
    function closeBottomModal() {
      if (typeof bottomModal.close === "function" && bottomModal.open) bottomModal.close();
      else bottomModal.removeAttribute("open");
      bottomModalOpen.focus();
    }
    bottomModalOpen.addEventListener("click", function () {
      if (typeof bottomModal.showModal === "function") bottomModal.showModal();
      else bottomModal.setAttribute("open", "");
      bottomModal.querySelector(".bottom-modal-close").focus();
    });
    bottomModal.querySelector(".bottom-modal-close").addEventListener("click", closeBottomModal);
    bottomModal.querySelector(".bottom-modal-done").addEventListener("click", closeBottomModal);
    bottomModal.addEventListener("click", function (event) {
      if (event.target === bottomModal) closeBottomModal();
    });
  }

  var stampToggle = document.querySelector(".stamp-toggle");
  var stampPostcard = document.querySelector(".stamp-postcard");
  if (stampToggle && stampPostcard) {
    stampToggle.addEventListener("click", function () {
      var stamped = stampToggle.getAttribute("aria-pressed") !== "true";
      stampToggle.setAttribute("aria-pressed", String(stamped));
      stampPostcard.classList.toggle("is-stamped", stamped);
      stampToggle.textContent = stamped ? "Fjern poststempel" : "Sæt poststempel";
      stampPostcard.querySelector(".travel-stamp").setAttribute("aria-label", stamped
        ? "Frimærke med fjord, sol, skov og poststempel"
        : "Frimærke med fjord, sol og skov");
    });
  }

  var pathCanvas = document.querySelector(".path-canvas");
  var pathToggle = document.querySelector(".path-toggle");
  var pathStatus = document.querySelector(".path-status");
  if (pathCanvas && pathToggle && pathStatus) {
    var pathContext = pathCanvas.getContext("2d");
    if (!pathContext) {
      pathStatus.textContent = "Canvas understøttes ikke i denne browser.";
      pathToggle.disabled = true;
    } else {
      var pathFrame = 0;
      var pathTime = 0;
      var pathRunning = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var pathSize = { width: 0, height: 0, ratio: 1 };
      function resizePathCanvas() {
        var rect = pathCanvas.getBoundingClientRect();
        pathSize.width = Math.max(1, rect.width);
        pathSize.height = Math.max(1, rect.height);
        pathSize.ratio = Math.min(window.devicePixelRatio || 1, 2);
        pathCanvas.width = Math.round(pathSize.width * pathSize.ratio);
        pathCanvas.height = Math.round(pathSize.height * pathSize.ratio);
        pathContext.setTransform(pathSize.ratio, 0, 0, pathSize.ratio, 0, 0);
      }
      function drawPathScene() {
        var width = pathSize.width;
        var height = pathSize.height;
        var inset = Math.min(24, width * .08);
        var left = inset;
        var right = width - inset;
        var top = 16;
        var bottom = height - 16;
        // Lærredet kan måle 0 px, mens det er skjult. Så er der intet at tegne
        if (bottom - top < 8 || right - left < 8) return;
        var radius = Math.min(28, (right - left) / 5, (bottom - top) / 2);
        pathContext.clearRect(0, 0, width, height);
        pathContext.beginPath();
        pathContext.roundRect(left, top, right - left, bottom - top, radius);
        pathContext.strokeStyle = "rgba(53,83,76,.22)";
        pathContext.lineWidth = 1;
        pathContext.stroke();
        pathContext.fillStyle = "rgba(53,83,76,.55)";
        pathContext.font = "12px sans-serif";
        pathContext.textAlign = "center";
        pathContext.fillText("Følg den bløde sti", width / 2, height / 2 + 4);
        var perimeter = 2 * (right - left - 2 * radius) + 2 * (bottom - top - 2 * radius) + 2 * Math.PI * radius;
        [0, .32, .66].forEach(function (offset, index) {
          var distance = ((pathTime * (index + 1) * .21 + offset) % 1) * perimeter;
          var x;
          var y;
          var straightTop = right - left - 2 * radius;
          var straightSide = bottom - top - 2 * radius;
          if (distance < straightTop) {
            x = left + radius + distance; y = top;
          } else if ((distance -= straightTop) < Math.PI * radius / 2) {
            var angle = -Math.PI / 2 + distance / radius;
            x = right - radius + Math.cos(angle) * radius; y = top + radius + Math.sin(angle) * radius;
          } else if ((distance -= Math.PI * radius / 2) < straightSide) {
            x = right; y = top + radius + distance;
          } else if ((distance -= straightSide) < Math.PI * radius / 2) {
            var angle2 = distance / radius;
            x = right - radius + Math.cos(angle2) * radius; y = bottom - radius + Math.sin(angle2) * radius;
          } else if ((distance -= Math.PI * radius / 2) < straightTop) {
            x = right - radius - distance; y = bottom;
          } else if ((distance -= straightTop) < Math.PI * radius / 2) {
            var angle3 = Math.PI / 2 + distance / radius;
            x = left + radius + Math.cos(angle3) * radius; y = bottom - radius + Math.sin(angle3) * radius;
          } else if ((distance -= Math.PI * radius / 2) < straightSide) {
            x = left; y = bottom - radius - distance;
          } else {
            distance -= straightSide;
            var angle4 = Math.PI + distance / radius;
            x = left + radius + Math.cos(angle4) * radius; y = top + radius + Math.sin(angle4) * radius;
          }
          var dotRadius = index === 0 ? 5 : 3.5;
          var glow = pathContext.createRadialGradient(x, y, 0, x, y, 17);
          glow.addColorStop(0, index === 0 ? "rgba(194,119,71,.65)" : "rgba(72,118,111,.5)");
          glow.addColorStop(1, "rgba(72,118,111,0)");
          pathContext.fillStyle = glow;
          pathContext.beginPath();
          pathContext.arc(x, y, 17, 0, Math.PI * 2);
          pathContext.fill();
          pathContext.fillStyle = index === 0 ? "#bd754c" : "#4d8278";
          pathContext.beginPath();
          pathContext.arc(x, y, dotRadius, 0, Math.PI * 2);
          pathContext.fill();
        });
        if (pathRunning) {
          pathTime += .003;
          pathFrame = window.requestAnimationFrame(drawPathScene);
        }
      }
      function startPathAnimation() {
        window.cancelAnimationFrame(pathFrame);
        drawPathScene();
      }
      resizePathCanvas();
      startPathAnimation();
      window.addEventListener("resize", function () {
        resizePathCanvas();
        if (!pathRunning) drawPathScene();
      });
      pathToggle.setAttribute("aria-pressed", String(pathRunning));
      if (!pathRunning) {
        pathToggle.textContent = "Start bevægelse";
        pathStatus.textContent = "Animationen er sat på pause på grund af indstillingen for reduceret bevægelse.";
      }
      pathToggle.addEventListener("click", function () {
        pathRunning = !pathRunning;
        pathToggle.setAttribute("aria-pressed", String(pathRunning));
        pathToggle.textContent = pathRunning ? "Sæt bevægelse på pause" : "Start bevægelse";
        pathStatus.textContent = pathRunning ? "Lysprikker følger stien." : "Bevægelsen er sat på pause.";
        if (pathRunning) startPathAnimation();
        else {
          window.cancelAnimationFrame(pathFrame);
          drawPathScene();
        }
      });
    }
  }

  var sideCurtain = document.querySelector(".side-curtain-stage");
  var sideCurtainToggle = document.querySelector(".side-curtain-toggle");
  if (sideCurtain && sideCurtainToggle) {
    var sideCurtainStatus = document.querySelector(".side-curtain-status");
    sideCurtainToggle.addEventListener("click", function () {
      var open = sideCurtain.dataset.open !== "true";
      sideCurtain.dataset.open = String(open);
      sideCurtainToggle.setAttribute("aria-expanded", String(open));
      sideCurtainToggle.textContent = open ? "Luk gardinet" : "Åbn gardinet";
      sideCurtainStatus.textContent = open ? "Scenen er åben." : "Scenen er dækket.";
    });
  }

  var oceanScene = document.querySelector(".ocean-scene");
  var oceanSlider = document.querySelector(".ocean-drift");
  var oceanValue = document.querySelector(".ocean-value");
  if (oceanScene && oceanSlider && oceanValue) {
    function setOceanDrift(value) {
      var drift = Math.max(-40, Math.min(40, value));
      oceanScene.style.setProperty("--ocean-drift", drift + "px");
      oceanSlider.value = String(Math.round(drift));
      oceanValue.value = String(Math.round(drift));
      oceanValue.textContent = String(Math.round(drift));
    }
    oceanSlider.addEventListener("input", function () { setOceanDrift(Number(oceanSlider.value)); });
    oceanScene.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse" || !oceanScene.matches(":hover")) return;
      var rect = oceanScene.getBoundingClientRect();
      setOceanDrift(((event.clientX - rect.left) / rect.width - .5) * 70);
    });
    oceanScene.addEventListener("pointerleave", function () {
      setOceanDrift(Number(oceanSlider.value));
    });
  }

  var retroToggle = document.querySelector(".retro-poster-toggle");
  var retroPoster = document.querySelector(".retro-poster");
  if (retroToggle && retroPoster) {
    retroToggle.addEventListener("click", function () {
      var alternate = retroToggle.getAttribute("aria-pressed") !== "true";
      retroToggle.setAttribute("aria-pressed", String(alternate));
      retroPoster.dataset.posterTone = alternate ? "1" : "0";
      retroToggle.textContent = alternate ? "Skift tilbage" : "Skift farvetone";
    });
  }

  var planCards = Array.from(document.querySelectorAll(".plan-card"));
  var planStatus = document.querySelector(".plan-status");
  if (planCards.length && planStatus) {
    var planDescriptions = {
      start: "Start er valgt — enkelt, fokuseret og lige til at komme i gang med.",
      gro: "Gro er valgt — en god balance mellem plads og enkelhed.",
      udfold: "Udfold er valgt — mere rum til indhold og nye funktioner."
    };
    planCards.forEach(function (card) {
      card.addEventListener("click", function () {
        planCards.forEach(function (choice) {
          choice.setAttribute("aria-pressed", String(choice === card));
        });
        planStatus.textContent = planDescriptions[card.dataset.plan];
      });
      card.addEventListener("keydown", function (event) {
        if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
        event.preventDefault();
        var direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        var next = planCards[(planCards.indexOf(card) + direction + planCards.length) % planCards.length];
        next.focus();
        next.click();
      });
    });
  }

  var pseudoStatus = document.querySelector(".pseudo-status");
  if (pseudoStatus) {
    document.querySelectorAll(".pseudo-button").forEach(function (button) {
      button.addEventListener("click", function () {
        pseudoStatus.textContent = "Effekten “" + button.textContent.trim() + "” er klar til at blive brugt.";
      });
    });
  }

  var tileBoard = document.querySelector(".tile-board");
  var tileStatus = document.querySelector(".tile-status");
  if (tileBoard && tileStatus) {
    for (var tileIndex = 0; tileIndex < 9; tileIndex++) {
      var tile = document.createElement("button");
      tile.type = "button";
      tile.textContent = String(tileIndex + 1).padStart(2, "0");
      tile.setAttribute("aria-pressed", "false");
      tile.setAttribute("aria-label", "Flise " + (tileIndex + 1) + ", ikke løftet");
      tileBoard.appendChild(tile);
    }
    tileBoard.addEventListener("click", function (event) {
      var tileButton = event.target.closest("button");
      if (!tileButton) return;
      var lifted = tileButton.getAttribute("aria-pressed") !== "true";
      tileBoard.querySelectorAll("button").forEach(function (button) {
        button.setAttribute("aria-pressed", String(button === tileButton && lifted));
        button.setAttribute("aria-label", "Flise " + button.textContent + (button === tileButton && lifted ? ", løftet" : ", ikke løftet"));
      });
      tileStatus.textContent = lifted ? "Flise " + tileButton.textContent + " er løftet." : "Vælg en flise for at løfte den.";
    });
  }

  var editDemo = document.querySelector(".demo-edit-text");
  if (editDemo) {
    var editReplay = editDemo.querySelector(".edit-replay");
    var editStatus = editDemo.querySelector(".edit-status");
    editReplay.addEventListener("click", function () {
      editDemo.classList.remove("is-replaying");
      void editDemo.offsetWidth;
      editDemo.classList.add("is-replaying");
      editStatus.textContent = "Rettelsen vises igen.";
    });
    editDemo.addEventListener("animationend", function (event) {
      if (event.target === editDemo.querySelector("ins")) editDemo.classList.remove("is-replaying");
    });
  }

  var inviteToggle = document.querySelector(".invite-toggle");
  var inviteEnvelope = document.querySelector(".invite-envelope");
  if (inviteToggle && inviteEnvelope) {
    var inviteCard = inviteEnvelope.querySelector(".invite-card");
    var inviteStatus = document.querySelector(".invite-status");
    inviteToggle.addEventListener("click", function () {
      var opened = inviteEnvelope.dataset.open === "true";
      var flipped = inviteCard.dataset.flipped === "true";
      if (!opened) {
        inviteEnvelope.dataset.open = "true";
        inviteToggle.setAttribute("aria-expanded", "true");
        inviteToggle.textContent = "Vend kortet";
        inviteStatus.textContent = "Kuverten er åbnet — kortet er klar.";
      } else if (!flipped) {
        inviteCard.dataset.flipped = "true";
        inviteToggle.textContent = "Vend tilbage";
        inviteStatus.textContent = "Bagsiden fortæller lidt mere.";
      } else {
        inviteCard.dataset.flipped = "false";
        inviteEnvelope.dataset.open = "false";
        inviteToggle.setAttribute("aria-expanded", "false");
        inviteToggle.textContent = "Åbn invitationen";
        inviteStatus.textContent = "Invitationen er lagt tilbage i kuverten.";
      }
    });
  }

  var cakeStage = document.querySelector(".cake-stage");
  var cakeReveal = document.querySelector(".cake-reveal");
  var cakeCandles = document.querySelector(".cake-candles");
  var cakeStatus = document.querySelector(".cake-status");
  if (cakeStage && cakeReveal && cakeCandles && cakeStatus) {
    cakeStage.dataset.candles = "on";
    cakeReveal.addEventListener("click", function () {
      var revealed = cakeStage.dataset.revealed !== "true";
      cakeStage.dataset.revealed = String(revealed);
      cakeReveal.setAttribute("aria-expanded", String(revealed));
      cakeReveal.textContent = revealed ? "Luk gardinet" : "Træk gardinet fra";
      cakeStatus.textContent = revealed ? "Overraskelsen er afsløret." : "Overraskelsen er klar.";
    });
    cakeCandles.addEventListener("click", function () {
      var candlesOut = cakeStage.dataset.candles !== "out";
      cakeStage.dataset.candles = candlesOut ? "out" : "on";
      cakeCandles.setAttribute("aria-pressed", String(!candlesOut));
      cakeCandles.textContent = candlesOut ? "Tænd lysene" : "Pust lysene ud";
      cakeStatus.textContent = candlesOut ? "Puf — lysene er slukket." : "Lysene er tændt igen.";
    });
  }

  var keyCapture = document.querySelector(".key-capture");
  var keyHistory = document.querySelector(".key-history");
  if (keyCapture && keyHistory) {
    var keyName = keyCapture.querySelector(".key-name");
    var keyCode = keyCapture.querySelector(".key-code");
    var recentKeys = [];
    keyCapture.addEventListener("keydown", function (event) {
      if (event.key === "Tab" || event.metaKey || event.ctrlKey || event.altKey) return;
      var displayKey = event.key === " " ? "Mellemrum" : event.key;
      keyName.textContent = displayKey;
      keyCode.textContent = "event.code: " + event.code;
      keyCapture.classList.add("is-key-down");
      if (!event.repeat) {
        recentKeys.unshift(displayKey);
        recentKeys = recentKeys.slice(0, 4);
        keyHistory.textContent = "Seneste taster: " + recentKeys.join(" · ");
      }
    });
    keyCapture.addEventListener("keyup", function () {
      keyCapture.classList.remove("is-key-down");
    });
    keyCapture.addEventListener("blur", function () {
      keyCapture.classList.remove("is-key-down");
    });
  }

  var buttonFill = document.querySelector(".button-fill");
  var fillButton = document.querySelector(".fill-button");
  var fillOutput = document.querySelector(".fill-value");
  var fillStatus = document.querySelector(".fill-status");
  if (buttonFill && fillButton && fillOutput && fillStatus) {
    function updateButtonFill() {
      var fill = Number(buttonFill.value);
      fillButton.style.setProperty("--fill-percent", fill + "%");
      fillOutput.value = fill + " %";
      fillOutput.textContent = fill + " %";
      fillStatus.textContent = "Fyldet står på " + fill + " procent.";
    }
    buttonFill.addEventListener("input", updateButtonFill);
    fillButton.addEventListener("click", function () {
      var active = fillButton.getAttribute("aria-pressed") !== "true";
      fillButton.setAttribute("aria-pressed", String(active));
      fillStatus.textContent = active ? "Idéen er sat i gang." : "Idéen er sat på pause.";
    });
    updateButtonFill();
  }

  var curveHue = document.querySelector(".curve-hue");
  var curvedScene = document.querySelector(".curved-color-scene");
  var curveOutput = document.querySelector(".curve-value");
  if (curveHue && curvedScene && curveOutput) {
    function updateCurveHue() {
      var hue = Number(curveHue.value);
      curvedScene.style.setProperty("--curve-hue", hue);
      curveOutput.value = hue + "°";
      curveOutput.textContent = hue + "°";
    }
    curveHue.addEventListener("input", updateCurveHue);
    updateCurveHue();
  }

  var cubeTurn = document.querySelector(".cube-turn");
  var lineCube = document.querySelector(".line-cube");
  var cubeOutput = document.querySelector(".cube-value");
  var cubeContrast = document.querySelector(".cube-contrast");
  if (cubeTurn && lineCube && cubeOutput) {
    function updateCubeTurn() {
      var degree = Number(cubeTurn.value);
      lineCube.style.setProperty("--cube-turn", degree + "deg");
      cubeOutput.value = degree + "°";
      cubeOutput.textContent = degree + "°";
    }
    cubeTurn.addEventListener("input", updateCubeTurn);
    updateCubeTurn();
    if (cubeContrast) {
      cubeContrast.addEventListener("click", function () {
        var reversed = cubeContrast.getAttribute("aria-pressed") !== "true";
        cubeContrast.setAttribute("aria-pressed", String(reversed));
        lineCube.classList.toggle("is-reversed", reversed);
      });
    }
  }

  var samplePassword = document.querySelector(".sample-password");
  var passwordMeter = document.querySelector(".password-meter");
  var passwordFill = document.querySelector(".password-meter-fill");
  var passwordStrength = document.querySelector(".password-strength");
  var passwordVisibility = document.querySelector(".password-visibility");
  if (samplePassword && passwordMeter && passwordFill && passwordStrength && passwordVisibility) {
    var strengthNames = ["Skriv et fiktivt kodeord for at prøve måleren.", "Meget svagt eksempel", "Svagt eksempel", "Rimeligt eksempel", "Stærkere eksempel"];
    function updatePasswordStrength() {
      var value = samplePassword.value;
      var score = 0;
      if (value.length >= 8) score++;
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
      if (/\d/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      if (!value) score = 0;
      passwordMeter.setAttribute("aria-valuenow", String(score));
      passwordMeter.setAttribute("aria-valuetext", strengthNames[score]);
      passwordFill.style.width = (score * 25) + "%";
      passwordFill.style.backgroundColor = ["#bd7162", "#bd7162", "#ca9851", "#789b76", "#438278"][score];
      passwordStrength.textContent = strengthNames[score];
    }
    samplePassword.addEventListener("input", updatePasswordStrength);
    passwordVisibility.addEventListener("click", function () {
      var visible = samplePassword.type === "password";
      samplePassword.type = visible ? "text" : "password";
      passwordVisibility.setAttribute("aria-pressed", String(visible));
      passwordVisibility.setAttribute("aria-label", visible ? "Skjul testkodeord" : "Vis testkodeord");
      passwordVisibility.textContent = visible ? "Skjul" : "Vis";
      samplePassword.focus();
    });
  }

  var orbitMenu = document.querySelector(".orbit-menu");
  if (orbitMenu) {
    var orbitCenter = orbitMenu.querySelector(".orbit-center");
    var orbitActions = orbitMenu.querySelector(".orbit-actions");
    var orbitStatus = document.querySelector(".orbit-status");
    function setOrbitMenu(open, restoreFocus) {
      orbitMenu.dataset.open = String(open);
      orbitCenter.setAttribute("aria-expanded", String(open));
      orbitCenter.querySelector("span").textContent = open ? "×" : "+";
      orbitActions.setAttribute("aria-hidden", String(!open));
      orbitActions.inert = !open;
      orbitStatus.textContent = open ? "Vælg en retning." : "Menuen er lukket.";
      if (open) orbitActions.querySelector("button").focus();
      else if (restoreFocus) orbitCenter.focus();
    }
    orbitCenter.addEventListener("click", function () {
      setOrbitMenu(orbitMenu.dataset.open !== "true", true);
    });
    orbitActions.addEventListener("click", function (event) {
      var action = event.target.closest("[data-orbit-action]");
      if (!action) return;
      orbitStatus.textContent = action.dataset.orbitAction + " — valgt.";
      setOrbitMenu(false, true);
    });
    orbitMenu.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && orbitMenu.dataset.open === "true") {
        event.preventDefault();
        setOrbitMenu(false, true);
      }
    });
  }

  var foldModal = document.querySelector(".fold-modal");
  var foldModalOpen = document.querySelector(".fold-modal-open");
  if (foldModal && foldModalOpen) {
    var foldCloseTimer;
    function closeFoldModal() {
      window.clearTimeout(foldCloseTimer);
      if (foldModal.open) {
        foldModal.classList.add("is-closing");
        foldCloseTimer = window.setTimeout(function () {
          if (foldModal.open) foldModal.close();
          foldModal.classList.remove("is-closing");
          foldModalOpen.focus();
        }, 280);
      } else {
        foldModal.removeAttribute("open");
        foldModalOpen.focus();
      }
    }
    foldModalOpen.addEventListener("click", function () {
      window.clearTimeout(foldCloseTimer);
      foldModal.classList.remove("is-closing");
      if (typeof foldModal.showModal === "function") foldModal.showModal();
      else foldModal.setAttribute("open", "");
      foldModal.querySelector(".fold-modal-close").focus();
    });
    foldModal.querySelector(".fold-modal-close").addEventListener("click", closeFoldModal);
    foldModal.querySelector(".fold-modal-done").addEventListener("click", closeFoldModal);
    foldModal.addEventListener("cancel", function () {
      foldModalOpen.focus();
    });
    foldModal.addEventListener("click", function (event) {
      if (event.target === foldModal) closeFoldModal();
    });
    foldModal.addEventListener("close", function () {
      foldModal.classList.remove("is-closing");
      foldModalOpen.focus();
    });
  }

  var flowerPattern = document.querySelector(".flower-pattern");
  var flowerKind = document.querySelector(".flower-kind");
  var flowerCount = document.querySelector(".flower-count");
  var flowerCountValue = document.querySelector(".flower-count-value");
  var flowerStatus = document.querySelector(".flower-status");
  if (flowerPattern && flowerKind && flowerCount && flowerCountValue && flowerStatus) {
    function renderFlowerPattern() {
      var flower = flowerKind.value;
      var count = Number(flowerCount.value);
      var fragment = document.createDocumentFragment();
      for (var flowerIndex = 0; flowerIndex < count; flowerIndex++) {
        var bloom = document.createElement("span");
        bloom.setAttribute("aria-hidden", "true");
        bloom.textContent = flower;
        bloom.style.animationDelay = Math.min(flowerIndex * .012, .24) + "s";
        bloom.style.transform = "rotate(" + ((flowerIndex * 37) % 360) + "deg)";
        fragment.appendChild(bloom);
      }
      flowerPattern.replaceChildren(fragment);
      flowerPattern.dataset.flower = flower;
      var flowerNames = { "🌷": "tulipaner", "🌼": "tusindfryd", "🌻": "solsikker", "🌸": "kirsebærblomster" };
      var flowerName = flowerNames[flower] || "blomster";
      flowerPattern.setAttribute("aria-label", "Gentaget mønster med " + flowerName);
      flowerCountValue.value = String(count);
      flowerCountValue.textContent = String(count);
      flowerStatus.textContent = count + " " + flowerName + " i mønsteret.";
    }
    flowerKind.addEventListener("change", renderFlowerPattern);
    flowerCount.addEventListener("input", renderFlowerPattern);
    renderFlowerPattern();
  }

  var citySearch = document.querySelector(".city-search-input");
  var cityResults = document.querySelector(".city-results");
  var citySearchStatus = document.querySelector(".city-search-status");
  if (citySearch && cityResults && citySearchStatus) {
    var danishCities = ["Aalborg", "Aarhus", "Esbjerg", "Fredericia", "Helsingør", "Herning", "Hillerød", "Hjørring", "Holbæk", "Horsens", "Kolding", "København", "Næstved", "Odense", "Randers", "Roskilde", "Silkeborg", "Skive", "Slagelse", "Svendborg", "Vejle", "Viborg"];
    var activeCityIndex = -1;
    function normalizeCity(value) {
      return value.toLocaleLowerCase("da").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    function closeCityResults() {
      cityResults.hidden = true;
      citySearch.setAttribute("aria-expanded", "false");
      citySearch.removeAttribute("aria-activedescendant");
      activeCityIndex = -1;
    }
    function selectCity(city) {
      citySearch.value = city;
      closeCityResults();
      citySearchStatus.textContent = city + " valgt.";
    }
    function renderCityResults() {
      var query = normalizeCity(citySearch.value.trim());
      cityResults.replaceChildren();
      activeCityIndex = -1;
      if (!query) {
        closeCityResults();
        citySearchStatus.textContent = "Skriv for at se forslag.";
        return;
      }
      var matches = danishCities.filter(function (city) {
        return normalizeCity(city).includes(query);
      }).slice(0, 5);
      if (!matches.length) {
        closeCityResults();
        citySearchStatus.textContent = "Ingen byer matcher endnu.";
        return;
      }
      matches.forEach(function (city, index) {
        var option = document.createElement("button");
        option.type = "button";
        option.id = "city-suggestion-" + index;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", "false");
        option.textContent = city;
        cityResults.appendChild(option);
      });
      cityResults.hidden = false;
      citySearch.setAttribute("aria-expanded", "true");
      citySearchStatus.textContent = matches.length + " forslag.";
    }
    citySearch.addEventListener("input", renderCityResults);
    citySearch.addEventListener("keydown", function (event) {
      var options = cityResults.querySelectorAll('[role="option"]');
      if ((event.key === "ArrowDown" || event.key === "ArrowUp") && options.length) {
        event.preventDefault();
        activeCityIndex = (activeCityIndex + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length;
        options.forEach(function (option, index) {
          option.setAttribute("aria-selected", index === activeCityIndex ? "true" : "false");
        });
        citySearch.setAttribute("aria-activedescendant", options[activeCityIndex].id);
      } else if (event.key === "Enter" && activeCityIndex >= 0 && options[activeCityIndex]) {
        event.preventDefault();
        selectCity(options[activeCityIndex].textContent);
      } else if (event.key === "Escape") {
        closeCityResults();
      }
    });
    cityResults.addEventListener("click", function (event) {
      var option = event.target.closest('[role="option"]');
      if (option) selectCity(option.textContent);
    });
    citySearch.addEventListener("blur", function () {
      window.setTimeout(closeCityResults, 120);
    });
  }

  var hatchAngle = document.querySelector(".hatch-angle");
  var hatchAngleValue = document.querySelector(".hatch-angle-value");
  var hatchPattern = document.querySelector("#hatch-pattern-83");
  if (hatchAngle && hatchAngleValue && hatchPattern) {
    function updateHatchAngle() {
      hatchPattern.setAttribute("patternTransform", "rotate(-" + hatchAngle.value + ")");
      hatchAngleValue.value = hatchAngle.value + "°";
      hatchAngleValue.textContent = hatchAngle.value + "°";
    }
    hatchAngle.addEventListener("input", updateHatchAngle);
    updateHatchAngle();
  }

  var planeLaunch = document.querySelector(".plane-launch");
  var planeSky = document.querySelector(".plane-sky");
  var planeStatus = document.querySelector(".plane-status");
  if (planeLaunch && planeSky && planeStatus) {
    var planeTimer;
    planeLaunch.addEventListener("click", function () {
      window.clearTimeout(planeTimer);
      planeLaunch.disabled = true;
      planeSky.classList.add("is-launched");
      planeStatus.textContent = "En lille hilsen er på vej.";
      planeTimer = window.setTimeout(function () {
        planeSky.classList.remove("is-launched");
        planeLaunch.disabled = false;
        planeStatus.textContent = "Flyveren er landet — send en ny?";
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 900);
    });
  }

  var diagonalAngle = document.querySelector(".diagonal-angle");
  var diagonalAngleValue = document.querySelector(".diagonal-angle-value");
  var diagonalScene = document.querySelector(".diagonal-scene");
  if (diagonalAngle && diagonalAngleValue && diagonalScene) {
    function updateDiagonalScene() {
      diagonalScene.style.setProperty("--diagonal-angle", diagonalAngle.value + "deg");
      diagonalScene.style.setProperty("--diagonal-opposite", (-Number(diagonalAngle.value)) + "deg");
      diagonalAngleValue.value = diagonalAngle.value + "°";
      diagonalAngleValue.textContent = diagonalAngle.value + "°";
    }
    diagonalAngle.addEventListener("input", updateDiagonalScene);
    updateDiagonalScene();
  }

  var motionDialog = document.querySelector(".motion-dialog");
  var motionDialogOpen = document.querySelector(".motion-modal-open");
  var motionDialogStatus = document.querySelector(".motion-modal-status");
  if (motionDialog && motionDialogOpen && motionDialogStatus) {
    var motionDialogTimer;
    function closeMotionDialog() {
      window.clearTimeout(motionDialogTimer);
      if (!motionDialog.open) return;
      motionDialog.classList.add("is-closing");
      motionDialogTimer = window.setTimeout(function () {
        if (motionDialog.open) motionDialog.close();
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 20 : 240);
    }
    function openMotionDialog() {
      window.clearTimeout(motionDialogTimer);
      motionDialog.classList.remove("is-closing");
      if (typeof motionDialog.showModal === "function") motionDialog.showModal();
      else motionDialog.setAttribute("open", "");
      motionDialog.querySelector(".motion-dialog-close").focus();
      motionDialogStatus.textContent = "Dialogen er åben.";
    }
    motionDialogOpen.addEventListener("click", openMotionDialog);
    motionDialog.querySelector(".motion-dialog-close").addEventListener("click", closeMotionDialog);
    motionDialog.querySelector(".motion-dialog-done").addEventListener("click", closeMotionDialog);
    motionDialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeMotionDialog();
    });
    motionDialog.addEventListener("click", function (event) {
      if (event.target === motionDialog) closeMotionDialog();
    });
    motionDialog.addEventListener("close", function () {
      motionDialog.classList.remove("is-closing");
      motionDialogOpen.focus();
      motionDialogStatus.textContent = "Dialogen er lukket.";
    });
  }

  var quoteMachine = document.querySelector("[data-quote-machine]");
  if (quoteMachine) {
    var quotes = [
      { category: "Om læring", text: "Man lærer mere, når man tør stille det næste spørgsmål." },
      { category: "Om sprog", text: "De rigtige ord kan gøre en svær tanke lettere at dele." },
      { category: "Om fællesskab", text: "En idé vokser, når flere får lov til at bygge videre på den." },
      { category: "Om nysgerrighed", text: "Et lille forsøg kan åbne en helt ny retning." }
    ];
    var quoteIndex = 0;
    var quoteText = quoteMachine.querySelector("[data-quote-text]");
    var quoteCategory = quoteMachine.querySelector("[data-quote-category]");
    var quoteCount = quoteMachine.querySelector("[data-quote-count]");
    function showQuote(index) {
      quoteIndex = (index + quotes.length) % quotes.length;
      quoteText.textContent = quotes[quoteIndex].text;
      quoteCategory.textContent = quotes[quoteIndex].category;
      quoteCount.textContent = (quoteIndex + 1) + " af " + quotes.length;
    }
    quoteMachine.querySelector("[data-quote-previous]").addEventListener("click", function () {
      showQuote(quoteIndex - 1);
    });
    quoteMachine.querySelector("[data-quote-next]").addEventListener("click", function () {
      showQuote(quoteIndex + 1);
    });
  }

  var softFocus = document.querySelector("#soft-focus-strength");
  var softFocusValue = document.querySelector("[data-soft-focus-value]");
  if (softFocus && softFocusValue) {
    var softFocusArt = softFocus.closest(".demo").querySelector(".soft-focus-art");
    softFocus.addEventListener("input", function () {
      var value = Number(softFocus.value);
      softFocusArt.style.setProperty("--soft-blur", value + "px");
      softFocusValue.value = String(value);
      softFocusValue.textContent = String(value);
    });
  }

  var swirlToggle = document.querySelector("[data-swirl-toggle]");
  var swirlScene = document.querySelector(".swirl-scene");
  if (swirlToggle && swirlScene) {
    swirlToggle.addEventListener("click", function () {
      var paused = swirlScene.classList.toggle("is-paused");
      swirlToggle.setAttribute("aria-pressed", String(paused));
      swirlToggle.textContent = paused ? "Fortsæt bevægelsen" : "Sæt bevægelsen på pause";
    });
  }

  var snapStory = document.querySelector("[data-snap-story]");
  if (snapStory) {
    var snapPanels = Array.from(snapStory.querySelectorAll("[data-snap-panel]"));
    var snapButtons = document.querySelectorAll("[data-snap-to]");
    function updateSnapStory() {
      if (!snapStory.clientHeight) return;
      var index = Math.round(snapStory.scrollTop / snapStory.clientHeight);
      snapButtons.forEach(function (button, buttonIndex) {
        if (buttonIndex === index) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
    }
    snapButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = snapPanels[Number(button.dataset.snapTo)];
        if (!panel) return;
        snapStory.scrollTo({
          top: panel.offsetTop,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
      });
    });
    snapStory.addEventListener("scroll", updateSnapStory, { passive: true });
    window.addEventListener("resize", updateSnapStory);
  }

  var leafToggle = document.querySelector("[data-leaf-toggle]");
  var leafScene = document.querySelector(".leaf-scene");
  if (leafToggle && leafScene) {
    leafToggle.addEventListener("click", function () {
      var paused = leafScene.classList.toggle("is-paused");
      leafToggle.setAttribute("aria-pressed", String(paused));
      leafToggle.textContent = paused ? "Lad bladene drive igen" : "Sæt bladene på pause";
    });
  }

  var stageShift = document.querySelector("[data-stage-shift]");
  if (stageShift) {
    var stageScene = stageShift.querySelector("[data-stage-scene]");
    var stageLabel = stageShift.querySelector("[data-stage-label]");
    var stageTitle = stageShift.querySelector("[data-stage-title]");
    var stageButton = stageShift.querySelector("[data-stage-toggle]");
    var stageStatus = stageShift.querySelector("[data-stage-status]");
    var stageIndex = 0;
    if (stageScene && stageLabel && stageTitle && stageButton && stageStatus) {
      var stageOptions = [
        { label: "SCENE 1 · RO", title: "Giv tanken plads" },
        { label: "SCENE 2 · BEVÆGELSE", title: "Lad idéen tage form" }
      ];
      stageButton.addEventListener("click", function () {
        stageIndex = (stageIndex + 1) % stageOptions.length;
        var scene = stageOptions[stageIndex];
        stageScene.classList.remove("is-changing");
        void stageScene.offsetWidth;
        stageScene.classList.add("is-changing");
        stageScene.dataset.scene = String(stageIndex + 1);
        stageLabel.textContent = scene.label;
        stageTitle.textContent = scene.title;
        stageStatus.textContent = "Scene " + (stageIndex + 1) + " af " + stageOptions.length;
        stageButton.disabled = true;
        window.setTimeout(function () {
          stageScene.classList.remove("is-changing");
          stageButton.disabled = false;
        }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 30 : 640);
      });
    }
  }

  document.querySelectorAll("[data-golden-ratio]").forEach(function (button) {
    button.addEventListener("click", function () {
      var composition = button.closest(".demo").querySelector(".golden-composition");
      composition.dataset.ratio = button.dataset.goldenRatio;
      button.closest(".demo").querySelectorAll("[data-golden-ratio]").forEach(function (choice) {
        choice.setAttribute("aria-pressed", String(choice === button));
      });
    });
  });

  var spotlightArt = document.querySelector("[data-spotlight-art]");
  var spotlightSize = document.querySelector("#spotlight-size");
  var spotlightValue = document.querySelector("[data-spotlight-value]");
  if (spotlightArt) {
    function moveSpotlight(event) {
      var rect = spotlightArt.getBoundingClientRect();
      spotlightArt.style.setProperty("--spot-x", ((event.clientX - rect.left) / rect.width * 100) + "%");
      spotlightArt.style.setProperty("--spot-y", ((event.clientY - rect.top) / rect.height * 100) + "%");
    }
    spotlightArt.addEventListener("pointermove", moveSpotlight);
    spotlightArt.addEventListener("focus", function () {
      spotlightArt.style.setProperty("--spot-x", "50%");
      spotlightArt.style.setProperty("--spot-y", "50%");
    });
  }
  if (spotlightArt && spotlightSize && spotlightValue) {
    spotlightSize.addEventListener("input", function () {
      var value = Number(spotlightSize.value);
      spotlightArt.style.setProperty("--spot-size", value + "%");
      spotlightValue.value = String(value);
      spotlightValue.textContent = String(value);
    });
  }

  var heroAtelier = document.querySelector("[data-hero-atelier]");
  if (heroAtelier) {
    var heroScenes = [
      { kicker: "SPROG · MENNESKER · MENING", title: "Forstå det.<br>Del det.", copy: "Gør komplekse idéer lettere at bruge." },
      { kicker: "IDÉ · SKITSE · LØSNING", title: "Byg noget.<br>Prøv det.", copy: "Lad en god tanke få form i virkeligheden." },
      { kicker: "LYT · SAMARBEJD · SKAB", title: "Skab det.<br>Sammen.", copy: "De stærkeste løsninger vokser mellem mennesker." }
    ];
    var heroSceneIndex = 0;
    var heroScene = heroAtelier.querySelector("[data-hero-scene]");
    var heroKicker = heroAtelier.querySelector("[data-hero-kicker]");
    var heroTitle = heroAtelier.querySelector("[data-hero-title]");
    var heroCopy = heroAtelier.querySelector("[data-hero-copy]");
    var heroSteps = heroAtelier.querySelectorAll("[data-hero-step]");
    function showHeroScene(index) {
      heroSceneIndex = (index + heroScenes.length) % heroScenes.length;
      var scene = heroScenes[heroSceneIndex];
      heroScene.dataset.scene = String(heroSceneIndex + 1);
      heroKicker.textContent = scene.kicker;
      heroTitle.textContent = scene.title.replace(/<br>/g, " ");
      heroCopy.textContent = scene.copy;
      heroSteps.forEach(function (button, buttonIndex) {
        button.setAttribute("aria-current", String(buttonIndex === heroSceneIndex));
      });
    }
    heroSteps.forEach(function (button) {
      button.addEventListener("click", function () {
        showHeroScene(Number(button.dataset.heroStep));
      });
    });
    heroAtelier.querySelector("[data-hero-prev]").addEventListener("click", function () {
      showHeroScene(heroSceneIndex - 1);
    });
    heroAtelier.querySelector("[data-hero-next]").addEventListener("click", function () {
      showHeroScene(heroSceneIndex + 1);
    });
  }

  var typeScene = document.querySelector("[data-type-scene]");
  if (typeScene) {
    var typeWords = ["Nysgerrighed", "Forbindelser", "Muligheder", "Fællesskab"];
    var typeWordIndex = 0;
    var typeTitle = typeScene.querySelector("[data-type-scene-title]");
    var typeTimer;
    function playTypeScene(nextWord) {
      window.clearTimeout(typeTimer);
      if (nextWord) {
        typeWordIndex = (typeWordIndex + 1) % typeWords.length;
        typeTitle.textContent = typeWords[typeWordIndex];
      }
      typeScene.classList.remove("is-playing");
      void typeScene.offsetWidth;
      typeScene.classList.add("is-playing");
      typeTimer = window.setTimeout(function () {
        typeScene.classList.remove("is-playing");
      }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 30 : 850);
    }
    typeScene.querySelector("[data-type-scene-replay]").addEventListener("click", function () {
      playTypeScene(false);
    });
    typeScene.querySelector("[data-type-scene-next]").addEventListener("click", function () {
      playTypeScene(true);
    });
    playTypeScene(false);
  }

  var rippleDialog = document.querySelector("[data-ripple-dialog]");
  var rippleOpen = document.querySelector("[data-ripple-open]");
  var rippleStatus = document.querySelector("[data-ripple-status]");
  if (rippleDialog && rippleOpen && rippleStatus) {
    function closeRippleDialog() {
      if (rippleDialog.open) rippleDialog.close();
    }
    rippleOpen.addEventListener("click", function () {
      rippleDialog.classList.remove("is-closing");
      if (typeof rippleDialog.showModal === "function") rippleDialog.showModal();
      else rippleDialog.setAttribute("open", "");
      rippleDialog.querySelector("[data-ripple-close]").focus();
      rippleStatus.textContent = "Invitationen er åben.";
    });
    rippleDialog.querySelectorAll("[data-ripple-close]").forEach(function (button) {
      button.addEventListener("click", closeRippleDialog);
    });
    rippleDialog.addEventListener("click", function (event) {
      if (event.target === rippleDialog) closeRippleDialog();
    });
    rippleDialog.addEventListener("close", function () {
      rippleOpen.focus();
      rippleStatus.textContent = "Invitationen er lukket.";
    });
  }

  var sketchTasks = document.querySelectorAll("[data-sketch-task]");
  var sketchProgress = document.querySelector("[data-sketch-progress]");
  if (sketchTasks.length && sketchProgress) {
    function updateSketchProgress() {
      var checked = Array.from(sketchTasks).filter(function (task) { return task.checked; }).length;
      sketchProgress.textContent = checked + " af " + sketchTasks.length + " idéer markeret";
    }
    sketchTasks.forEach(function (task) {
      task.addEventListener("change", updateSketchProgress);
    });
  }

  var calendarForm = document.querySelector("[data-calendar-form]");
  var calendarStatus = document.querySelector("[data-calendar-status]");
  if (calendarForm && calendarStatus) {
    var calendarDate = calendarForm.elements.date;
    if (calendarDate && !calendarDate.value) {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      calendarDate.value = [tomorrow.getFullYear(), String(tomorrow.getMonth() + 1).padStart(2, "0"), String(tomorrow.getDate()).padStart(2, "0")].join("-");
    }
    calendarForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!calendarForm.reportValidity()) return;
      var data = new FormData(calendarForm);
      var title = String(data.get("title") || "").trim();
      var date = String(data.get("date") || "");
      var time = String(data.get("time") || "");
      var details = String(data.get("details") || "").trim();
      var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
      var clock = /^(\d{2}):(\d{2})$/.exec(time);
      if (!match || !clock) {
        calendarStatus.textContent = "Tjek dato og klokkeslæt, og prøv igen.";
        return;
      }
      var start = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(clock[1]), Number(clock[2]));
      if (Number.isNaN(start.getTime()) || start.getFullYear() !== Number(match[1]) || start.getMonth() !== Number(match[2]) - 1 || start.getDate() !== Number(match[3])) {
        calendarStatus.textContent = "Datoen ser ikke gyldig ud. Vælg en anden dato.";
        return;
      }
      var end = new Date(start.getTime() + 45 * 60 * 1000);
      function icsDate(value) {
        return [value.getFullYear(), String(value.getMonth() + 1).padStart(2, "0"), String(value.getDate()).padStart(2, "0")].join("") +
          "T" + [String(value.getHours()).padStart(2, "0"), String(value.getMinutes()).padStart(2, "0"), "00"].join("");
      }
      function escapeIcs(value) {
        return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
      }
      function foldIcsLine(line) {
        var chunks = [];
        var chunk = "";
        var byteLength = 0;
        Array.from(line).forEach(function (character) {
          var code = character.codePointAt(0);
          var characterBytes = code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
          if (byteLength + characterBytes > 75) {
            chunks.push(chunk);
            chunk = " ";
            byteLength = 1;
          }
          chunk += character;
          byteLength += characterBytes;
        });
        chunks.push(chunk);
        return chunks;
      }
      var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      var uid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      var lines = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Villads Claes//Legeplads//DA",
        "CALSCALE:GREGORIAN", "BEGIN:VEVENT", "UID:" + uid + "@villadsclaes.dk",
        "DTSTAMP:" + stamp, "DTSTART:" + icsDate(start), "DTEND:" + icsDate(end),
        "SUMMARY:" + escapeIcs(title)
      ];
      if (details) lines.push("DESCRIPTION:" + escapeIcs(details));
      lines.push("END:VEVENT", "END:VCALENDAR");
      var file = new Blob([lines.flatMap(foldIcsLine).join("\r\n")], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(file);
      var link = document.createElement("a");
      link.href = url;
      link.download = "invitation.ics";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      calendarStatus.textContent = "Kalenderfilen er klar til at åbne eller gemme.";
    });
  }

  var menuBoard = document.querySelector(".demo-menu-board");
  if (menuBoard) {
    var menuItems = Array.from(menuBoard.querySelectorAll(".menu-board-item"));
    var menuTitle = menuBoard.querySelector("[data-menu-detail-title]");
    var menuCopy = menuBoard.querySelector("[data-menu-detail-copy]");
    function selectMenuItem(item) {
      menuItems.forEach(function (candidate) {
        candidate.setAttribute("aria-pressed", String(candidate === item));
      });
      menuTitle.textContent = item.dataset.menuName;
      menuCopy.textContent = item.dataset.menuDescription;
    }
    menuBoard.querySelectorAll("[data-menu-filter]").forEach(function (filter) {
      filter.addEventListener("click", function () {
        var category = filter.dataset.menuFilter;
        menuBoard.querySelectorAll("[data-menu-filter]").forEach(function (button) {
          button.setAttribute("aria-pressed", String(button === filter));
        });
        menuItems.forEach(function (item) {
          item.hidden = category !== "all" && item.dataset.menuCategory !== category;
        });
        var selected = menuItems.find(function (item) { return !item.hidden && item.getAttribute("aria-pressed") === "true"; });
        if (!selected) selected = menuItems.find(function (item) { return !item.hidden; });
        if (selected) selectMenuItem(selected);
      });
    });
    menuItems.forEach(function (item) {
      item.addEventListener("click", function () { selectMenuItem(item); });
    });
  }

  document.querySelectorAll("[data-coupon-toggle]").forEach(function (button) {
    var details = document.getElementById(button.getAttribute("aria-controls"));
    if (!details) return;
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      details.hidden = expanded;
      button.textContent = expanded ? "Vis detalje" : "Skjul detalje";
    });
  });

  var reliefStage = document.querySelector("[data-relief-stage]");
  var reliefDepth = document.querySelector("[data-relief-depth]");
  var reliefAngle = document.querySelector("[data-relief-angle]");
  if (reliefStage && reliefDepth && reliefAngle) {
    var depthOutput = document.querySelector("[data-relief-depth-value]");
    var angleOutput = document.querySelector("[data-relief-angle-value]");
    function updateRelief() {
      var depth = Number(reliefDepth.value);
      var angle = Number(reliefAngle.value) * Math.PI / 180;
      reliefStage.style.setProperty("--relief-x", (Math.cos(angle) * depth).toFixed(1) + "px");
      reliefStage.style.setProperty("--relief-y", (Math.sin(angle) * depth).toFixed(1) + "px");
      depthOutput.value = depth + " px";
      depthOutput.textContent = depth + " px";
      angleOutput.value = reliefAngle.value + "°";
      angleOutput.textContent = reliefAngle.value + "°";
    }
    reliefDepth.addEventListener("input", updateRelief);
    reliefAngle.addEventListener("input", updateRelief);
    updateRelief();
  }

  var duotoneHue = document.querySelector("[data-duotone-hue]");
  var duotoneArt = document.querySelector("[data-duotone-art]");
  var duotoneOriginal = document.querySelector("[data-duotone-original]");
  if (duotoneHue && duotoneArt && duotoneOriginal) {
    var hueOutput = document.querySelector("[data-duotone-hue-value]");
    function updateDuotone() {
      duotoneArt.style.setProperty("--duotone-hue", duotoneHue.value);
      duotoneArt.dataset.original = String(duotoneOriginal.checked);
      duotoneArt.setAttribute("aria-label", duotoneOriginal.checked ? "Abstrakt landskab uden farvefilter" : "Abstrakt landskab med duotonefarver");
      hueOutput.value = duotoneHue.value + "°";
      hueOutput.textContent = duotoneHue.value + "°";
    }
    duotoneHue.addEventListener("input", updateDuotone);
    duotoneOriginal.addEventListener("change", updateDuotone);
    updateDuotone();
  }

  var popScene = document.querySelector("[data-pop-scene]");
  var popTrigger = document.querySelector("[data-pop-trigger]");
  var popStatus = document.querySelector("[data-pop-status]");
  if (popScene && popTrigger && popStatus) {
    popTrigger.addEventListener("click", function () {
      popScene.dataset.popState = "idle";
      void popScene.offsetWidth;
      popScene.dataset.popState = "show";
      popStatus.textContent = "En idé er dukket op.";
    });
  }

  var starfield = document.querySelector("[data-starfield]");
  var starToggle = document.querySelector("[data-star-toggle]");
  var starStatus = document.querySelector("[data-star-status]");
  if (starfield && starToggle && starStatus) {
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      starfield.dataset.starRunning = "false";
      starToggle.setAttribute("aria-pressed", "false");
      starToggle.textContent = "Genoptag";
      starStatus.textContent = "Stjernefeltet er sat på pause efter din indstilling for reduceret bevægelse.";
    }
    function updateStarStatus() {
      var running = starfield.dataset.starRunning === "true";
      var speed = starfield.dataset.starSpeed;
      var speedLabel = speed === "slow" ? "langsomt" : speed === "fast" ? "hurtigt" : "roligt";
      starToggle.textContent = running ? "Sæt på pause" : "Genoptag";
      starToggle.setAttribute("aria-pressed", String(running));
      starStatus.textContent = running ? "Stjernefeltet bevæger sig " + speedLabel + "." : "Stjernefeltet er sat på pause.";
    }
    document.querySelectorAll(".starfield-controls [data-star-speed]").forEach(function (button) {
      button.addEventListener("click", function () {
        starfield.dataset.starSpeed = button.dataset.starSpeed;
        document.querySelectorAll(".starfield-controls [data-star-speed]").forEach(function (choice) {
          choice.setAttribute("aria-pressed", String(choice === button));
        });
        updateStarStatus();
      });
    });
    starToggle.addEventListener("click", function () {
      starfield.dataset.starRunning = String(starfield.dataset.starRunning !== "true");
      updateStarStatus();
    });
  }

  var treeCanvas = document.querySelector("[data-tree-canvas]");
  var treeDepth = document.querySelector("[data-tree-depth]");
  var treeLeaves = document.querySelector("[data-tree-leaves]");
  var treeGrow = document.querySelector("[data-tree-grow]");
  var treeStatus = document.querySelector("[data-tree-status]");
  if (treeCanvas && treeDepth && treeLeaves && treeGrow && treeStatus) {
    var treeContext = treeCanvas.getContext("2d");
    var treeDepthValue = document.querySelector("[data-tree-depth-value]");
    var treeFrame = 0;
    function drawTree(animate) {
      if (!treeContext) return;
      if (treeFrame) cancelAnimationFrame(treeFrame);
      var bounds = treeCanvas.getBoundingClientRect();
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      var width = Math.max(1, bounds.width);
      var height = Math.max(1, bounds.height);
      treeCanvas.width = Math.round(width * ratio);
      treeCanvas.height = Math.round(height * ratio);
      treeContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      var branches = [];
      function branch(x, y, length, angle, level, thickness) {
        var endX = x + Math.sin(angle) * length;
        var endY = y - Math.cos(angle) * length;
        branches.push({ x: x, y: y, endX: endX, endY: endY, level: level, thickness: thickness });
        if (level > 0) {
          var spread = .28 + Math.random() * .16;
          branch(endX, endY, length * (.68 + Math.random() * .08), angle - spread, level - 1, thickness * .72);
          branch(endX, endY, length * (.68 + Math.random() * .08), angle + spread, level - 1, thickness * .72);
        }
      }
      var depth = Number(treeDepth.value);
      branch(width / 2, height - 8, height * .34, 0, depth, Math.max(2, depth * 1.15));
      var sky = treeContext.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#bbd9e5");
      sky.addColorStop(1, "#f3e8cf");
      function paint(count) {
        treeContext.clearRect(0, 0, width, height);
        treeContext.fillStyle = sky;
        treeContext.fillRect(0, 0, width, height);
        treeContext.fillStyle = "#819b7e";
        treeContext.fillRect(0, height - 9, width, 9);
        branches.slice(0, count).forEach(function (line) {
          treeContext.beginPath();
          treeContext.moveTo(line.x, line.y);
          treeContext.lineTo(line.endX, line.endY);
          treeContext.lineWidth = Math.max(1, line.thickness);
          treeContext.lineCap = "round";
          treeContext.strokeStyle = line.level > 2 ? "#604d3e" : "#4e6d4d";
          treeContext.stroke();
          if (treeLeaves.checked && line.level === 0 && count === branches.length) {
            treeContext.beginPath();
            treeContext.arc(line.endX, line.endY, 3.5, 0, Math.PI * 2);
            treeContext.fillStyle = "#668653";
            treeContext.fill();
          }
        });
      }
      if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        paint(branches.length);
        return;
      }
      var visible = 0;
      function growFrame() {
        visible = Math.min(branches.length, visible + Math.ceil(branches.length / 16));
        paint(visible);
        if (visible < branches.length) treeFrame = requestAnimationFrame(growFrame);
        else treeFrame = 0;
      }
      growFrame();
    }
    function updateTreeDepth() {
      treeDepthValue.value = treeDepth.value;
      treeDepthValue.textContent = treeDepth.value;
      treeStatus.textContent = "Træet er tegnet med " + treeDepth.value + " forgreningsniveauer.";
    }
    treeDepth.addEventListener("input", function () { updateTreeDepth(); drawTree(true); });
    treeLeaves.addEventListener("change", function () { drawTree(false); });
    treeGrow.addEventListener("click", function () { drawTree(true); treeStatus.textContent = "En ny træform vokser frem."; });
    window.addEventListener("resize", function () { drawTree(false); });
    updateTreeDepth();
    drawTree(false);
  }

  var speechBubble = document.querySelector("[data-speech-bubble]");
  var bubbleInput = document.querySelector("[data-bubble-input]");
  var bubbleStatus = document.querySelector("[data-bubble-status]");
  if (speechBubble && bubbleInput && bubbleStatus) {
    document.querySelectorAll("[data-bubble-shape]").forEach(function (button) {
      button.addEventListener("click", function () {
        speechBubble.dataset.bubbleShape = button.dataset.bubbleShape;
        document.querySelectorAll(".bubble-shape-controls [data-bubble-shape]").forEach(function (choice) {
          choice.setAttribute("aria-pressed", String(choice === button));
        });
        bubbleStatus.textContent = "Form: " + button.textContent + ".";
      });
    });
    var bubbleCopy = document.querySelector("[data-bubble-copy]");
    function updateBubbleCopy() {
      bubbleCopy.textContent = bubbleInput.value.trim() || "Skriv en lille replik.";
    }
    bubbleInput.addEventListener("input", updateBubbleCopy);
    updateBubbleCopy();
  }

  var depthRange = document.querySelector("[data-depth-range]");
  var depthScene = document.querySelector("[data-depth-scene]");
  var depthValue = document.querySelector("[data-depth-value]");
  if (depthRange && depthScene && depthValue) {
    function updateDepthScene() {
      var distance = Number(depthRange.value);
      depthScene.style.setProperty("--far-offset", (-distance * .22).toFixed(1) + "px");
      depthScene.style.setProperty("--near-offset", (distance * .48).toFixed(1) + "px");
      depthValue.value = distance + " px";
      depthValue.textContent = distance + " px";
    }
    depthRange.addEventListener("input", updateDepthScene);
    updateDepthScene();
  }

  var textCardInput = document.querySelector("[data-text-card-input]");
  var textCardCount = document.querySelector("[data-text-card-count]");
  var textCardCopy = document.querySelector("[data-text-card-copy]");
  var textCardStatus = document.querySelector("[data-text-card-status]");
  if (textCardInput && textCardCount && textCardCopy && textCardStatus) {
    function updateTextCardCount() {
      textCardCount.value = textCardInput.value.length + " / " + textCardInput.maxLength + " tegn";
      textCardCount.textContent = textCardCount.value;
    }
    textCardInput.addEventListener("input", updateTextCardCount);
    textCardCopy.addEventListener("click", function () {
      var text = textCardInput.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          textCardStatus.textContent = "Teksten er kopieret til udklipsholderen.";
        }, function () {
          textCardStatus.textContent = "Browseren afviste kopiering. Markér teksten og kopiér den manuelt.";
        });
        return;
      }
      textCardInput.focus();
      textCardInput.select();
      var copied = document.execCommand("copy");
      textCardCopy.focus();
      textCardStatus.textContent = copied ? "Teksten er kopieret til udklipsholderen." : "Kopiering understøttes ikke her. Markér teksten og kopiér den manuelt.";
    });
    updateTextCardCount();
  }

})();
