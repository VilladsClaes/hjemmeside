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

  document.querySelectorAll(".letter-buttons button").forEach(function (button) {
    button.addEventListener("click", function () {
      button.classList.remove("is-bouncing");
      void button.offsetWidth;
      button.classList.add("is-bouncing");
    });
    button.addEventListener("animationend", function () {
      button.classList.remove("is-bouncing");
    });
  });

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

  var projectSearch = document.querySelector(".project-search");
  var projectFilterButtons = document.querySelectorAll("[data-project-filter]");
  var projectResults = document.querySelectorAll(".project-result");
  var filterStatus = document.querySelector(".filter-status");
  if (projectSearch && filterStatus && projectResults.length) {
    var activeFilter = "all";
    function filterProjects() {
      var query = projectSearch.value.trim().toLocaleLowerCase("da");
      var visible = 0;
      projectResults.forEach(function (result) {
        var matchesCategory = activeFilter === "all" || result.dataset.projectCategories.split(" ").includes(activeFilter);
        var matchesText = !query || result.textContent.toLocaleLowerCase("da").includes(query);
        result.hidden = !(matchesCategory && matchesText);
        if (!result.hidden) visible++;
      });
      filterStatus.textContent = visible === 1 ? "Viser 1 projekt" : "Viser " + visible + " projekter";
      if (visible === 0) filterStatus.textContent = "Ingen projekter matcher — prøv en anden søgning.";
    }
    projectSearch.addEventListener("input", filterProjects);
    projectFilterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.dataset.projectFilter;
        projectFilterButtons.forEach(function (other) {
          other.setAttribute("aria-pressed", String(other === button));
        });
        filterProjects();
      });
    });
  }

  var flashcards = [
    { word: "nysgerrig", meaning: "Villig til at undersøge, spørge og lære noget nyt." },
    { word: "samskabelse", meaning: "Når mennesker udvikler idéer og løsninger sammen." },
    { word: "tydelighed", meaning: "At gøre det let at forstå, hvad der sker, og hvad næste skridt er." },
    { word: "perspektiv", meaning: "En bestemt måde at se eller forstå en situation på." },
    { word: "meningsfuld", meaning: "Noget, der opleves vigtigt, relevant eller værd at bruge tid på." }
  ];
  var flashcard = document.querySelector(".flashcard");
  var flashcardIndex = 0;
  var flashcardFront = flashcard && flashcard.querySelector(".flashcard-front");
  var flashcardBack = flashcard && flashcard.querySelector(".flashcard-back");
  var flashcardKnown = document.querySelector(".flashcard-known");
  function renderFlashcard() {
    if (!flashcard || !flashcardFront || !flashcardBack) return;
    var card = flashcards[flashcardIndex];
    flashcardFront.querySelector(".flashcard-index").textContent =
      String(flashcardIndex + 1).padStart(2, "0") + " / " + String(flashcards.length).padStart(2, "0");
    flashcardFront.querySelector("strong").textContent = card.word;
    flashcardBack.querySelector("strong").textContent = card.meaning;
    var isFlipped = flashcard.classList.contains("is-flipped");
    flashcard.setAttribute("aria-label", isFlipped ? card.word + ": " + card.meaning : card.word + ". Vend ordkortet for at se betydningen.");
    flashcardFront.hidden = isFlipped;
    flashcardBack.hidden = !isFlipped;
    if (flashcardKnown) flashcardKnown.textContent = "Kort " + (flashcardIndex + 1) + " af " + flashcards.length + " · indbygget sæt, ingen API.";
  }
  if (flashcard && flashcardFront && flashcardBack) {
    flashcard.addEventListener("click", function () {
      flashcard.classList.toggle("is-flipped");
      renderFlashcard();
    });
    document.querySelectorAll("[data-flash-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        flashcardIndex = (flashcardIndex + Number(button.dataset.flashStep) + flashcards.length) % flashcards.length;
        flashcard.classList.remove("is-flipped");
        renderFlashcard();
      });
    });
    var shuffleCards = document.querySelector(".flashcard-shuffle");
    if (shuffleCards) {
      shuffleCards.addEventListener("click", function () {
        for (var index = flashcards.length - 1; index > 0; index--) {
          var randomIndex = Math.floor(Math.random() * (index + 1));
          var temp = flashcards[index];
          flashcards[index] = flashcards[randomIndex];
          flashcards[randomIndex] = temp;
        }
        flashcardIndex = 0;
        flashcard.classList.remove("is-flipped");
        renderFlashcard();
      });
    }
    renderFlashcard();
  }

  var artDescriptions = [
    { title: "Fjordlys", copy: "En rolig, abstrakt scene bygget af farver og former." },
    { title: "Grønne lag", copy: "Bløde grønne nuancer mødes i et lille landskab." },
    { title: "Aftenro", copy: "En varm aftenhimmel med bløde, mørkere toner." },
    { title: "Nye spor", copy: "Lyse lag giver plads til den næste idé." }
  ];
  var artDialog = document.querySelector(".art-dialog");
  var artDialogOpener;
  if (artDialog) {
    document.querySelectorAll("[data-art]").forEach(function (button) {
      button.addEventListener("click", function () {
        var index = Number(button.dataset.art);
        var art = artDescriptions[index];
        artDialogOpener = button;
        artDialog.querySelector("#art-dialog-title").textContent = art.title;
        artDialog.querySelector(".art-dialog-copy").textContent = art.copy;
        artDialog.querySelector(".art-large").dataset.art = String(index);
        if (typeof artDialog.showModal === "function") artDialog.showModal();
        else artDialog.setAttribute("open", "");
        artDialog.querySelector(".art-dialog-close").focus();
      });
    });
    function closeArtDialog() {
      if (typeof artDialog.close === "function" && artDialog.open) artDialog.close();
      else artDialog.removeAttribute("open");
      if (artDialogOpener) artDialogOpener.focus();
    }
    artDialog.querySelector(".art-dialog-close").addEventListener("click", closeArtDialog);
    artDialog.addEventListener("click", function (event) {
      if (event.target === artDialog) closeArtDialog();
    });
  }

  var curtainPanels = document.querySelectorAll(".curtain-panel");
  var curtainStatus = document.querySelector(".curtain-status");
  curtainPanels.forEach(function (panel) {
    panel.addEventListener("click", function () {
      var wasExpanded = panel.getAttribute("aria-expanded") === "true";
      curtainPanels.forEach(function (other) {
        var isExpanded = other === panel && !wasExpanded;
        other.setAttribute("aria-expanded", String(isExpanded));
        other.querySelector(".curtain-copy").hidden = !isExpanded;
      });
      if (curtainStatus) {
        curtainStatus.textContent = wasExpanded
          ? "Vælg et panel for at folde det ud."
          : panel.querySelector("strong").textContent + " — panelet er foldet ud. Tryk igen eller Escape for at lukke.";
      }
    });
    panel.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.getAttribute("aria-expanded") === "true") {
        panel.click();
        panel.focus();
      }
    });
  });

  var wordForm = document.querySelector(".wordmaker-form");
  var wordPreview = document.querySelector(".wordmaker-card");
  var wordStatus = document.querySelector(".wordmaker-status");
  if (wordForm && wordPreview && wordStatus) {
    var wordInput = wordForm.querySelector(".wordmaker-word");
    var typeInput = wordForm.querySelector(".wordmaker-type");
    var definitionInput = wordForm.querySelector(".wordmaker-definition");
    var authorInput = wordForm.querySelector(".wordmaker-author");
    var previewWord = wordPreview.querySelector(".wordmaker-preview-word");
    var previewType = wordPreview.querySelector(".wordmaker-preview-type");
    var previewDefinition = wordPreview.querySelector(".wordmaker-preview-definition");
    var previewExample = wordPreview.querySelector(".wordmaker-example");
    var previewAuthor = wordPreview.querySelector(".wordmaker-preview-author");
    function getWordData() {
      return {
        word: wordInput.value.trim() || "dit ord",
        type: typeInput.value,
        definition: definitionInput.value.trim() || "En forklaring venter på at blive skrevet.",
        author: authorInput.value.trim()
      };
    }
    function updateWordCard() {
      var data = getWordData();
      previewWord.textContent = data.word;
      previewType.textContent = "(" + data.type + ")";
      previewDefinition.textContent = data.definition;
      previewExample.textContent = "Eksempel på " + data.word;
      previewAuthor.textContent = data.author ? "Signeret " + data.author : "Et lille opslagskort";
      wordPreview.setAttribute("aria-label", "Ordbogskort: " + data.word + ", " + data.type);
      wordPreview.querySelector(".wordmaker-initial").textContent =
        (Array.from(data.word)[0] || "O").toLocaleUpperCase("da") + (Array.from(data.word)[0] || "o").toLocaleLowerCase("da");
      wordStatus.textContent = "Kortet opdateres, mens du skriver.";
    }
    [wordInput, typeInput, definitionInput, authorInput].forEach(function (input) {
      input.addEventListener("input", updateWordCard);
      input.addEventListener("change", updateWordCard);
    });
    function escapeSvgText(value) {
      return value.replace(/[&<>"']/g, function (character) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;" }[character];
      });
    }
    function wrapSvgText(text, maxLength) {
      var words = [];
      text.split(/\s+/).forEach(function (word) {
        while (word.length > maxLength) {
          words.push(word.slice(0, maxLength));
          word = word.slice(maxLength);
        }
        if (word) words.push(word);
      });
      var lines = [];
      var line = "";
      words.forEach(function (word) {
        var next = line ? line + " " + word : word;
        if (next.length > maxLength && line) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      });
      if (line) lines.push(line);
      if (lines.length > 4) {
        lines = lines.slice(0, 4);
        lines[3] = lines[3].slice(0, maxLength - 1) + "…";
      }
      return lines;
    }
    var downloadWordCard = wordForm.querySelector(".wordmaker-download");
    downloadWordCard.addEventListener("click", function () {
      var data = getWordData();
      var safeWord = escapeSvgText(data.word);
      var definitionLines = wrapSvgText(data.definition, 42);
      var definitionSvg = definitionLines.map(function (line, index) {
        return "<tspan x=\"80\" dy=\"" + (index === 0 ? 0 : 32) + "\">" + escapeSvgText(line) + "</tspan>";
      }).join("");
      var author = data.author ? "Signeret " + escapeSvgText(data.author) : "Et lille opslagskort";
      var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"900\" height=\"600\" viewBox=\"0 0 900 600\">" +
        "<rect width=\"900\" height=\"600\" rx=\"28\" fill=\"#f5f1e8\"/>" +
        "<path d=\"M28 28h844v544H28z\" rx=\"20\" fill=\"none\" stroke=\"#d8d3c8\" stroke-width=\"2\"/>" +
        "<text x=\"820\" y=\"105\" text-anchor=\"end\" fill=\"#c4d4ca\" font-family=\"Georgia,serif\" font-size=\"82\" font-weight=\"bold\">" +
        escapeSvgText((Array.from(data.word)[0] || "O").toLocaleUpperCase("da") + (Array.from(data.word)[0] || "o").toLocaleLowerCase("da")) + "</text>" +
        "<text x=\"80\" y=\"112\" fill=\"#567064\" font-family=\"Arial,sans-serif\" font-size=\"19\" font-weight=\"bold\" letter-spacing=\"4\">ET LILLE OPSLAG</text>" +
        "<text x=\"80\" y=\"230\" fill=\"#31596d\" font-family=\"Georgia,serif\" font-size=\"70\" font-weight=\"bold\">" + safeWord + "</text>" +
        "<text x=\"82\" y=\"278\" fill=\"#79857a\" font-family=\"Georgia,serif\" font-size=\"25\" font-style=\"italic\">(" + escapeSvgText(data.type) + ")</text>" +
        "<text x=\"80\" y=\"360\" fill=\"#47525a\" font-family=\"Arial,sans-serif\" font-size=\"26\">" + definitionSvg + "</text>" +
        "<path d=\"M80 492h740\" stroke=\"#dedbd0\" stroke-width=\"2\"/>" +
        "<text x=\"80\" y=\"542\" fill=\"#65716d\" font-family=\"Georgia,serif\" font-size=\"23\" font-style=\"italic\">Eksempel på " + safeWord + "</text>" +
        "<text x=\"820\" y=\"542\" text-anchor=\"end\" fill=\"#31596d\" font-family=\"Arial,sans-serif\" font-size=\"19\">" + author + "</text></svg>";
      var blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = (data.word.toLocaleLowerCase("da").replace(/[^a-z0-9æøå-]+/g, "-") || "ordbogskort") + ".svg";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      wordStatus.textContent = "Dit ordbogskort er hentet som en SVG-fil.";
    });
    updateWordCard();
  }

  var temperatureSlider = document.querySelector(".temperature-slider");
  var temperatureEmoji = document.querySelector(".temperature-emoji");
  var temperatureValue = document.querySelector(".temperature-value");
  var temperatureDescription = document.querySelector(".temperature-description");
  if (temperatureSlider && temperatureEmoji && temperatureValue && temperatureDescription) {
    function updateTemperature() {
      var temperature = Number(temperatureSlider.value);
      var feeling = temperature <= 8
        ? ["🥶", "Bidende koldt"]
        : temperature <= 16
          ? ["😬", "Friskt"]
          : temperature <= 24
            ? ["😊", "Lige tilpas"]
            : temperature <= 32
              ? ["😅", "Lunt"]
              : ["🥵", "Hed"];
      temperatureEmoji.textContent = feeling[0];
      temperatureEmoji.setAttribute("aria-label", feeling[1]);
      temperatureValue.textContent = temperature + " °C";
      temperatureDescription.textContent = feeling[1];
      temperatureSlider.setAttribute("aria-valuetext", temperature + " grader celsius, " + feeling[1]);
      temperatureSlider.style.setProperty("--temperature-progress", (temperature / 40 * 100) + "%");
    }
    temperatureSlider.addEventListener("input", updateTemperature);
    updateTemperature();
  }

  var memoryGrid = document.querySelector(".memory-grid");
  if (memoryGrid) {
    var memoryFaces = ["🌱", "🪁", "🌙", "🧩", "🍐", "🪻"];
    var memoryCards = [];
    var memoryOpen = [];
    var memoryMoves = 0;
    var memoryMatches = 0;
    var memoryTimer = null;
    var memoryMismatchTimer = null;
    var memoryStartedAt = 0;
    var memoryMoveOutput = document.querySelector(".memory-moves");
    var memoryTimeOutput = document.querySelector(".memory-time");
    var memoryStatus = document.querySelector(".memory-status");

    function formatMemoryTime(totalSeconds) {
      var minutes = Math.floor(totalSeconds / 60);
      var seconds = totalSeconds % 60;
      return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }
    function stopMemoryTimer() {
      if (memoryTimer) {
        window.clearInterval(memoryTimer);
        memoryTimer = null;
      }
    }
    function resetMemoryGame() {
      if (memoryMismatchTimer) window.clearTimeout(memoryMismatchTimer);
      memoryMismatchTimer = null;
      stopMemoryTimer();
      memoryOpen = [];
      memoryMoves = 0;
      memoryMatches = 0;
      memoryStartedAt = 0;
      memoryCards = memoryFaces.concat(memoryFaces).map(function (face, index) {
        return { face: face, key: index };
      });
      for (var index = memoryCards.length - 1; index > 0; index--) {
        var randomIndex = Math.floor(Math.random() * (index + 1));
        var card = memoryCards[index];
        memoryCards[index] = memoryCards[randomIndex];
        memoryCards[randomIndex] = card;
      }
      memoryGrid.replaceChildren();
      memoryCards.forEach(function (card, index) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "memory-card";
        button.dataset.face = card.face;
        button.dataset.position = String(index);
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", "Skjult kort " + (index + 1) + ", tryk for at vende");
        var face = document.createElement("span");
        face.className = "memory-card-face";
        face.setAttribute("aria-hidden", "true");
        face.textContent = card.face;
        button.appendChild(face);
        memoryGrid.appendChild(button);
      });
      memoryMoveOutput.textContent = "0";
      memoryTimeOutput.textContent = "00:00";
      memoryStatus.textContent = "Vælg et kort for at begynde.";
    }
    memoryGrid.addEventListener("click", function (event) {
      var card = event.target.closest(".memory-card");
      if (!card || !memoryGrid.contains(card) || card.disabled || memoryOpen.length === 2 ||
          card.dataset.matched === "true" || card.getAttribute("aria-pressed") === "true") return;

      if (!memoryStartedAt) {
        memoryStartedAt = Date.now();
        memoryTimer = window.setInterval(function () {
          memoryTimeOutput.textContent = formatMemoryTime(Math.floor((Date.now() - memoryStartedAt) / 1000));
        }, 1000);
      }
      card.setAttribute("aria-pressed", "true");
      card.setAttribute("aria-label", "Kort " + card.dataset.position + ": " + card.dataset.face);
      memoryOpen.push(card);
      if (memoryOpen.length === 1) {
        memoryStatus.textContent = "Vælg et kort mere.";
        return;
      }

      memoryMoves++;
      memoryMoveOutput.textContent = String(memoryMoves);
      if (memoryOpen[0].dataset.face === memoryOpen[1].dataset.face) {
        memoryOpen.forEach(function (matchedCard) {
          matchedCard.dataset.matched = "true";
          matchedCard.setAttribute("aria-label", "Fundet par: " + matchedCard.dataset.face);
        });
        memoryOpen = [];
        memoryMatches++;
        if (memoryMatches === memoryFaces.length) {
          stopMemoryTimer();
          memoryStatus.textContent = "Du fandt alle par på " + memoryMoves + " træk og " + memoryTimeOutput.textContent + ".";
        } else {
          memoryStatus.textContent = "Et par fundet! Find " + (memoryFaces.length - memoryMatches) + " mere.";
        }
      } else {
        memoryStatus.textContent = "Ikke et par — prøv igen.";
        memoryMismatchTimer = window.setTimeout(function () {
          memoryOpen.forEach(function (openCard) {
            openCard.setAttribute("aria-pressed", "false");
            openCard.setAttribute("aria-label", "Skjult kort " + (Number(openCard.dataset.position) + 1) + ", tryk for at vende");
          });
          memoryOpen = [];
          memoryMismatchTimer = null;
          memoryStatus.textContent = "Vælg et kort for at fortsætte.";
        }, 850);
      }
    });
    document.querySelector(".memory-restart").addEventListener("click", resetMemoryGame);
    resetMemoryGame();
  }

  var todoForm = document.querySelector(".todo-form");
  var todoEntry = document.querySelector(".todo-entry");
  var todoList = document.querySelector(".todo-list");
  var todoStatus = document.querySelector(".todo-status");
  var todoFilterButtons = document.querySelectorAll("[data-todo-filter]");
  if (todoForm && todoEntry && todoList && todoStatus) {
    var todoItems = [];
    var todoFilter = "all";
    var todoId = 0;
    var todoEmpty = todoList.querySelector(".todo-empty");

    function renderTodos() {
      if (todoEmpty) todoEmpty.remove();
      todoList.querySelectorAll(".todo-item").forEach(function (item) { item.remove(); });
      var visibleCount = 0;
      var openCount = 0;
      todoItems.forEach(function (item) {
        if (!item.done) openCount++;
        if ((todoFilter === "open" && item.done) || (todoFilter === "done" && !item.done)) return;
        visibleCount++;
        var row = document.createElement("li");
        row.className = "todo-item" + (item.done ? " is-done" : "");
        row.dataset.id = String(item.id);
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "todo-check";
        checkbox.checked = item.done;
        checkbox.setAttribute("aria-label", (item.done ? "Markér som i gang: " : "Markér som færdig: ") + item.text);
        var label = document.createElement("span");
        label.className = "todo-text";
        label.textContent = item.text;
        var toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "todo-action todo-toggle";
        toggleButton.textContent = item.done ? "I gang" : "Færdig";
        toggleButton.setAttribute("aria-label", (item.done ? "Markér som i gang: " : "Markér som færdig: ") + item.text);
        var deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "todo-action todo-delete";
        deleteButton.textContent = "Fjern";
        deleteButton.setAttribute("aria-label", "Fjern opgave: " + item.text);
        row.append(checkbox, label, toggleButton, deleteButton);
        todoList.appendChild(row);
      });
      if (visibleCount === 0) {
        var empty = document.createElement("li");
        empty.className = "todo-empty";
        empty.textContent = todoItems.length ? "Ingen opgaver i denne visning." : "Din liste venter på den første opgave.";
        todoList.appendChild(empty);
      }
      todoStatus.textContent = todoItems.length
        ? todoItems.length + " opgaver · " + openCount + " tilbage"
        : "Opgaver gemmes kun, mens siden er åben.";
    }
    todoForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var text = todoEntry.value.trim();
      if (!text) {
        todoStatus.textContent = "Skriv en opgave, før du tilføjer den.";
        todoEntry.focus();
        return;
      }
      todoItems.push({ id: ++todoId, text: text, done: false });
      todoEntry.value = "";
      renderTodos();
      todoStatus.textContent = "Opgaven er tilføjet.";
      todoEntry.focus();
    });
    todoList.addEventListener("change", function (event) {
      if (!event.target.matches(".todo-check")) return;
      var item = todoItems.find(function (todo) { return todo.id === Number(event.target.closest(".todo-item").dataset.id); });
      if (item) {
        item.done = event.target.checked;
        renderTodos();
      }
    });
    todoList.addEventListener("click", function (event) {
      var row = event.target.closest(".todo-item");
      if (!row) return;
      var itemId = Number(row.dataset.id);
      if (event.target.closest(".todo-delete")) {
        todoItems = todoItems.filter(function (item) { return item.id !== itemId; });
      } else if (event.target.closest(".todo-toggle")) {
        todoItems.forEach(function (item) { if (item.id === itemId) item.done = !item.done; });
      } else {
        return;
      }
      renderTodos();
    });
    todoFilterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        todoFilter = button.dataset.todoFilter;
        todoFilterButtons.forEach(function (other) {
          other.setAttribute("aria-pressed", String(other === button));
        });
        renderTodos();
      });
    });
    renderTodos();
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

  var checklist = document.querySelector(".checklist-options");
  var checklistStatus = document.querySelector(".checklist-status");
  if (checklist && checklistStatus) {
    function updateChecklist() {
      var inputs = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));
      var selected = inputs.filter(function (input) { return input.checked; }).map(function (input) { return input.value; });
      inputs.forEach(function (input) {
        input.closest("label").classList.toggle("is-selected", input.checked);
      });
      if (!selected.length) {
        checklistStatus.textContent = "Vælg de styrker, der passer på dig.";
      } else {
        checklistStatus.textContent = selected.length + " valgt: " + selected.join(", ");
      }
    }
    checklist.addEventListener("change", updateChecklist);
    updateChecklist();
    document.querySelector(".checklist-clear").addEventListener("click", function () {
      checklist.querySelectorAll('input[type="checkbox"]').forEach(function (input) { input.checked = false; });
      updateChecklist();
      checklist.querySelector('input[type="checkbox"]').focus();
    });
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

  var badgeStatus = document.querySelector(".badge-status");
  if (badgeStatus) {
    var badgeDescriptions = {
      Nysgerrig: "stiller spørgsmål og opdager nye muligheder.",
      Skaber: "gør idéer konkrete med små forsøg.",
      Lytter: "giver plads til andres perspektiver.",
      Samarbejder: "bygger videre sammen med andre.",
      Tålmodig: "giver læring tid til at vokse.",
      Modig: "tør prøve en ny retning."
    };
    document.querySelectorAll(".skill-badge").forEach(function (button) {
      button.addEventListener("click", function () {
        document.querySelectorAll(".skill-badge").forEach(function (badge) {
          badge.setAttribute("aria-pressed", String(badge === button));
        });
        var name = button.dataset.badge;
        badgeStatus.textContent = name + " — " + badgeDescriptions[name];
      });
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

  var countdownDate = document.querySelector(".countdown-date");
  var countdownStatus = document.querySelector(".countdown-status");
  var countdownTimer = document.querySelector(".countdown-values");
  if (countdownDate && countdownStatus && countdownTimer) {
    var countdownInterval = null;
    var countdownFields = {
      days: countdownTimer.querySelector(".count-days"),
      hours: countdownTimer.querySelector(".count-hours"),
      minutes: countdownTimer.querySelector(".count-minutes"),
      seconds: countdownTimer.querySelector(".count-seconds")
    };
    function formatLocalDate(date) {
      return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    }
    var today = new Date();
    countdownDate.min = formatLocalDate(today);
    var initialDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    countdownDate.value = formatLocalDate(initialDate);
    function updateCountdown() {
      var parts = countdownDate.value.split("-").map(Number);
      if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
        countdownStatus.textContent = "Vælg en dato for at starte nedtællingen.";
        return;
      }
      var target = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
      var difference = target - Date.now();
      if (difference <= 0) {
        Object.keys(countdownFields).forEach(function (unit) { countdownFields[unit].textContent = "00"; });
        countdownStatus.textContent = "Datoen er nået — god anledning til at fejre!";
        if (countdownInterval) {
          window.clearInterval(countdownInterval);
          countdownInterval = null;
        }
        return;
      }
      var seconds = Math.floor(difference / 1000);
      countdownFields.days.textContent = String(Math.floor(seconds / 86400)).padStart(2, "0");
      countdownFields.hours.textContent = String(Math.floor(seconds % 86400 / 3600)).padStart(2, "0");
      countdownFields.minutes.textContent = String(Math.floor(seconds % 3600 / 60)).padStart(2, "0");
      countdownFields.seconds.textContent = String(seconds % 60).padStart(2, "0");
      countdownStatus.textContent = "Tid til din dato.";
      if (!countdownInterval) countdownInterval = window.setInterval(updateCountdown, 1000);
    }
    countdownDate.addEventListener("change", updateCountdown);
    updateCountdown();
  }
})();
