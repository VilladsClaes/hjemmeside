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

  var recipeServings = document.querySelector(".recipe-servings");
  var recipeServingsValue = document.querySelector(".recipe-servings-value");
  var recipeStatus = document.querySelector(".recipe-status");
  if (recipeServings && recipeServingsValue && recipeStatus) {
    var recipeFormatter = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 1 });
    function updateRecipe() {
      var servings = Number(recipeServings.value);
      recipeServingsValue.value = String(servings);
      recipeServingsValue.textContent = String(servings);
      document.querySelectorAll("[data-recipe-amount]").forEach(function (amount) {
        amount.textContent = recipeFormatter.format(Number(amount.dataset.base) * servings / 2);
      });
      recipeStatus.textContent = "Mængderne er beregnet til " + servings + (servings === 1 ? " portion." : " portioner.");
    }
    recipeServings.addEventListener("input", updateRecipe);
    updateRecipe();
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

  var ideaRoute = document.querySelector(".demo-idea-route");
  if (ideaRoute) {
    var routeButtons = Array.prototype.slice.call(ideaRoute.querySelectorAll("[data-route-step]"));
    var routeMarkers = ideaRoute.querySelectorAll("[data-route-marker]");
    var routeProgress = ideaRoute.querySelector(".idea-route-progress");
    var routeStatus = ideaRoute.querySelector(".route-status");
    var routeDescriptions = [
      "Det begynder med et godt spørgsmål.",
      "Lyt til erfaringerne, før du vælger en retning.",
      "Prøv en lille version, og lær af det, der sker.",
      "Del det, du har fundet ud af, så andre kan bygge videre."
    ];
    if (routeButtons.length && routeProgress && routeStatus) {
      var routeLength = routeProgress.getTotalLength();
      routeProgress.style.setProperty("--route-length", routeLength);
      function selectRouteStep(step) {
        var index = Math.max(0, Math.min(routeButtons.length - 1, step));
        routeButtons.forEach(function (button, buttonIndex) {
          button.setAttribute("aria-pressed", buttonIndex === index ? "true" : "false");
        });
        routeMarkers.forEach(function (marker, markerIndex) {
          marker.classList.toggle("is-active", markerIndex === index);
        });
        routeProgress.style.setProperty("--route-offset", routeLength * (1 - index / (routeButtons.length - 1)));
        routeStatus.textContent = routeDescriptions[index];
      }
      routeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          selectRouteStep(Number(button.dataset.routeStep));
        });
      });
      selectRouteStep(0);
    }
  }

  var curiosityTable = document.querySelector(".demo-curiosity-table");
  if (curiosityTable) {
    var curiosityButtons = curiosityTable.querySelectorAll("[data-element-name]");
    var elementName = curiosityTable.querySelector(".element-name");
    var elementType = curiosityTable.querySelector(".element-type");
    var elementFact = curiosityTable.querySelector(".element-fact");
    curiosityButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        curiosityButtons.forEach(function (item) {
          item.setAttribute("aria-pressed", item === button ? "true" : "false");
        });
        elementName.textContent = button.dataset.elementName;
        elementType.textContent = button.dataset.elementType;
        elementFact.textContent = button.dataset.elementFact;
      });
    });
  }

  var processList = document.querySelector(".process-steps");
  if (processList) {
    var processButtons = Array.prototype.slice.call(processList.querySelectorAll("[data-process-step]"));
    var processDescription = document.querySelector(".process-description");
    var processCount = document.querySelector(".process-count");
    var processPrevious = document.querySelector(".process-previous");
    var processNext = document.querySelector(".process-next");
    var processDescriptions = [
      "Start med at blive klogere på spørgsmålet og på dem, det handler om.",
      "Undersøg behov, erfaringer og muligheder, før du beslutter dig.",
      "Byg en lille version, der kan afprøves og forbedres.",
      "Del resultatet, og gør plads til næste samtale."
    ];
    if (processButtons.length && processDescription && processCount && processPrevious && processNext) {
      var currentProcessStep = 0;
      function showProcessStep(step) {
        currentProcessStep = Math.max(0, Math.min(processButtons.length - 1, step));
        processButtons.forEach(function (button, index) {
          if (index === currentProcessStep) button.setAttribute("aria-current", "step");
          else button.removeAttribute("aria-current");
        });
        processList.style.setProperty("--process-progress", (currentProcessStep / (processButtons.length - 1) * 84) + "%");
        processDescription.textContent = processDescriptions[currentProcessStep];
        processCount.textContent = "Trin " + (currentProcessStep + 1) + " af " + processButtons.length;
        processPrevious.disabled = currentProcessStep === 0;
        processNext.disabled = currentProcessStep === processButtons.length - 1;
      }
      processButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          showProcessStep(Number(button.dataset.processStep));
        });
      });
      processPrevious.addEventListener("click", function () { showProcessStep(currentProcessStep - 1); });
      processNext.addEventListener("click", function () { showProcessStep(currentProcessStep + 1); });
      showProcessStep(0);
    }
  }

  var surveyForm = document.querySelector(".survey-form");
  if (surveyForm) {
    var surveyPanels = Array.prototype.slice.call(surveyForm.querySelectorAll("[data-survey-panel]"));
    var surveyResult = surveyForm.querySelector(".survey-result");
    var surveySummary = surveyForm.querySelector(".survey-summary");
    var surveyPrevious = surveyForm.querySelector(".survey-previous");
    var surveyNext = surveyForm.querySelector(".survey-next");
    var surveyReset = surveyForm.querySelector(".survey-reset");
    var surveyProgress = surveyForm.querySelector(".survey-progress");
    var surveyStatus = surveyForm.querySelector(".survey-status");
    if (surveyPanels.length && surveyResult && surveySummary && surveyPrevious && surveyNext && surveyReset && surveyProgress && surveyStatus) {
      var currentSurveyPanel = 0;
      function showSurveyPanel(index) {
        currentSurveyPanel = index;
        surveyPanels.forEach(function (panel, panelIndex) {
          panel.hidden = panelIndex !== index;
        });
        var complete = index === surveyPanels.length;
        surveyResult.hidden = !complete;
        surveyPrevious.hidden = complete;
        surveyNext.hidden = complete;
        surveyReset.hidden = !complete;
        surveyPrevious.disabled = index === 0;
        surveyProgress.textContent = complete ? "Færdig" : "Trin " + (index + 1) + " af " + surveyPanels.length;
        surveyStatus.textContent = complete ? "Dine svar fandtes kun i denne fane." : "Vælg et svar for at fortsætte.";
      }
      surveyNext.addEventListener("click", function () {
        var selected = surveyPanels[currentSurveyPanel].querySelector('input[type="radio"]:checked');
        if (!selected) {
          surveyStatus.textContent = "Vælg et svar, før du går videre.";
          surveyPanels[currentSurveyPanel].querySelector("input").focus();
          return;
        }
        if (currentSurveyPanel === surveyPanels.length - 1) {
          var answers = surveyPanels.map(function (panel) {
            return panel.querySelector('input[type="radio"]:checked').value;
          });
          surveySummary.textContent = answers.join(" · ");
          showSurveyPanel(surveyPanels.length);
        } else {
          showSurveyPanel(currentSurveyPanel + 1);
          surveyPanels[currentSurveyPanel].querySelector("input").focus();
        }
      });
      surveyPrevious.addEventListener("click", function () {
        if (currentSurveyPanel > 0 && currentSurveyPanel < surveyPanels.length) {
          showSurveyPanel(currentSurveyPanel - 1);
          surveyPanels[currentSurveyPanel].querySelector("input").focus();
        }
      });
      surveyReset.addEventListener("click", function () {
        surveyForm.reset();
        surveySummary.textContent = "";
        showSurveyPanel(0);
        surveyPanels[0].querySelector("input").focus();
      });
      surveyForm.addEventListener("submit", function (event) { event.preventDefault(); });
      showSurveyPanel(0);
    }
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

  var flipCard = document.querySelector("[data-flip-card]");
  var flipStatus = document.querySelector("[data-flip-status]");
  if (flipCard && flipStatus) {
    var flipFront = flipCard.querySelector(".flip-card-front");
    var flipBack = flipCard.querySelector(".flip-card-back");
    flipCard.addEventListener("click", function () {
      var flipped = flipCard.classList.toggle("is-flipped");
      flipCard.setAttribute("aria-pressed", String(flipped));
      flipCard.setAttribute("aria-label", flipped ? "Vend kortet til forsiden" : "Vend kortet til bagsiden");
      flipFront.setAttribute("aria-hidden", String(flipped));
      flipBack.setAttribute("aria-hidden", String(!flipped));
      flipStatus.textContent = flipped ? "Kortets bagside vises." : "Kortets forside vises.";
    });
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

  document.querySelectorAll("[data-card-layout]").forEach(function (button) {
    button.addEventListener("click", function () {
      var atelier = button.closest("[data-card-atelier]");
      atelier.querySelector(".atelier-card").dataset.layout = button.dataset.cardLayout;
      atelier.querySelectorAll("[data-card-layout]").forEach(function (choice) {
        choice.setAttribute("aria-pressed", String(choice === button));
      });
    });
  });

  var semanticNetwork = document.querySelector("[data-semantic-network]");
  if (semanticNetwork) {
    var networkDetails = {
      sprog: ["Sprog", "Ord, struktur og betydning bliver byggesten, når viden skal forstås og deles."],
      mening: ["Mening", "Betydning opstår i relationer: mellem ord, situationer og mennesker."],
      hyponet: ["Hyponet", "En semantisk model, der forbinder begreber og viser, hvordan de hænger sammen."],
      laering: ["Læring", "Forståelse vokser, når vi kan undersøge, afprøve og sætte ord på det nye."],
      data: ["Data", "Ordnet information kan hjælpe os med at finde mønstre og relevante forbindelser."],
      vaerktoej: ["Værktøj", "En digital løsning skal gøre en konkret opgave lettere at løse."],
      mennesker: ["Mennesker", "Teknologi giver mest mening, når den tager udgangspunkt i dem, der skal bruge den."]
    };
    var networkNodes = semanticNetwork.querySelectorAll("[data-network-node]");
    var networkTitle = semanticNetwork.querySelector("[data-network-title]");
    var networkDescription = semanticNetwork.querySelector("[data-network-description]");
    function selectNetworkNode(node) {
      var detail = networkDetails[node.dataset.networkNode];
      if (!detail) return;
      networkNodes.forEach(function (candidate) {
        candidate.classList.toggle("is-selected", candidate === node);
        candidate.setAttribute("aria-pressed", String(candidate === node));
      });
      networkTitle.textContent = detail[0];
      networkDescription.textContent = detail[1];
    }
    networkNodes.forEach(function (node) {
      node.addEventListener("click", function () { selectNetworkNode(node); });
      node.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectNetworkNode(node);
        }
      });
    });
    var networkStrength = semanticNetwork.querySelector("#network-strength");
    var networkStrengthValue = semanticNetwork.querySelector("[data-network-strength-value]");
    if (networkStrength && networkStrengthValue) {
      networkStrength.addEventListener("input", function () {
        var minimum = Number(networkStrength.value);
        networkStrengthValue.value = String(minimum);
        networkStrengthValue.textContent = String(minimum);
        semanticNetwork.querySelectorAll("[data-edge]").forEach(function (edge) {
          var visible = Number(edge.dataset.strength) >= minimum;
          edge.classList.toggle("is-filtered", !visible);
          edge.setAttribute("aria-hidden", String(!visible));
        });
      });
    }
  }

  var mosaicGrid = document.querySelector("[data-mosaic-grid]");
  var mosaicMore = document.querySelector("[data-mosaic-more]");
  var mosaicCount = document.querySelector("[data-mosaic-count]");
  if (mosaicGrid && mosaicMore && mosaicCount) {
    var mosaicItems = [
      { category: "05 · DESIGN", title: "Form følger funktion", description: "En tydelig løsning begynder med et godt spørgsmål.", size: "mosaic-medium", tone: "mosaic-tone-clay" },
      { category: "06 · SAMARBEJDE", title: "Byg videre sammen", description: "Forskellige perspektiver kan blive til én retning.", size: "mosaic-tall", tone: "mosaic-tone-forest" },
      { category: "07 · IDÉER", title: "Start i det små", description: "En skitse er også en begyndelse.", size: "mosaic-short", tone: "mosaic-tone-lilac" },
      { category: "08 · SPROG", title: "Gør forbindelsen synlig", description: "Struktur hjælper os med at finde mening.", size: "mosaic-medium", tone: "mosaic-tone-ochre" },
      { category: "09 · LÆRING", title: "Giv plads til spørgsmål", description: "Nysgerrighed er en god måde at komme videre på.", size: "mosaic-short", tone: "mosaic-tone-blue" },
      { category: "10 · PRAKSIS", title: "Prøv, mærk, justér", description: "Det brugbare bliver ofte til undervejs.", size: "mosaic-tall", tone: "mosaic-tone-sage" }
    ];
    var mosaicAdded = 0;
    mosaicMore.addEventListener("click", function () {
      var batch = mosaicItems.slice(mosaicAdded, mosaicAdded + 3);
      batch.forEach(function (item) {
        var card = document.createElement("article");
        card.className = "mosaic-card " + item.size + " " + item.tone + " mosaic-card-enter";
        var category = document.createElement("span");
        category.textContent = item.category;
        var title = document.createElement("strong");
        title.textContent = item.title;
        var description = document.createElement("p");
        description.textContent = item.description;
        card.append(category, title, description);
        mosaicGrid.appendChild(card);
        window.setTimeout(function () { card.classList.remove("mosaic-card-enter"); }, 420);
      });
      mosaicAdded += batch.length;
      var total = 4 + mosaicAdded;
      mosaicCount.textContent = total + " kort vist";
      if (mosaicAdded >= mosaicItems.length) {
        mosaicMore.disabled = true;
        mosaicMore.textContent = "Alle kort er vist";
      }
    });
  }

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

  var terrainCanvas = document.querySelector("[data-terrain-canvas]");
  var terrainRoughness = document.querySelector("[data-terrain-roughness]");
  var terrainGenerate = document.querySelector("[data-terrain-generate]");
  if (terrainCanvas && terrainRoughness && terrainGenerate) {
    var terrainContext = terrainCanvas.getContext("2d");
    var terrainValue = document.querySelector("[data-terrain-value]");
    function generateTerrain() {
      if (!terrainContext) return;
      var bounds = terrainCanvas.getBoundingClientRect();
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      var width = Math.max(1, bounds.width);
      var height = Math.max(1, bounds.height);
      terrainCanvas.width = Math.round(width * ratio);
      terrainCanvas.height = Math.round(height * ratio);
      terrainContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      var size = 33;
      var max = size - 1;
      var map = new Float32Array(size * size);
      function get(x, y) { return x < 0 || x > max || y < 0 || y > max ? null : map[x + size * y]; }
      function set(x, y, value) {
        map[x + size * y] = value;
      }
      function average(points) {
        var sum = 0;
        var count = 0;
        points.forEach(function (point) {
          if (point !== null) { sum += point; count++; }
        });
        return count ? sum / count : 0;
      }
      set(0, 0, .5); set(max, 0, .5); set(0, max, .5); set(max, max, .5);
      var step = max;
      var roughness = Number(terrainRoughness.value) / 100;
      var amplitude = .65;
      while (step > 1) {
        var half = step / 2;
        for (var y = half; y < max; y += step) {
          for (var x = half; x < max; x += step) {
            set(x, y, average([get(x - half, y - half), get(x + half, y - half), get(x - half, y + half), get(x + half, y + half)]) + (Math.random() * 2 - 1) * amplitude);
          }
        }
        for (var dy = 0; dy <= max; dy += half) {
          for (var dx = (dy + half) % step; dx <= max; dx += step) {
            set(dx, dy, average([get(dx - half, dy), get(dx + half, dy), get(dx, dy - half), get(dx, dy + half)]) + (Math.random() * 2 - 1) * amplitude);
          }
        }
        step = half;
        amplitude *= roughness;
      }
      var profile = [];
      var row = Math.floor(max / 2);
      for (var column = 0; column <= max; column++) profile.push(get(column, row));
      var low = Math.min.apply(null, profile);
      var high = Math.max.apply(null, profile);
      var sky = terrainContext.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#b9d5d7");
      sky.addColorStop(1, "#f1e4c6");
      terrainContext.clearRect(0, 0, width, height);
      terrainContext.fillStyle = sky;
      terrainContext.fillRect(0, 0, width, height);
      terrainContext.beginPath();
      terrainContext.arc(width * .8, height * .25, 19, 0, Math.PI * 2);
      terrainContext.fillStyle = "#f4d58d";
      terrainContext.fill();
      terrainContext.beginPath();
      profile.forEach(function (value, index) {
        var x = index / max * width;
        var normalized = (value - low) / Math.max(.001, high - low);
        var y = height * (.66 - normalized * .38);
        if (!index) terrainContext.moveTo(x, y);
        else terrainContext.lineTo(x, y);
      });
      terrainContext.lineTo(width, height);
      terrainContext.lineTo(0, height);
      terrainContext.closePath();
      var ground = terrainContext.createLinearGradient(0, height * .35, 0, height);
      ground.addColorStop(0, "#718e78");
      ground.addColorStop(1, "#304d49");
      terrainContext.fillStyle = ground;
      terrainContext.fill();
      terrainCanvas.setAttribute("aria-label", "Tilfældigt genereret terræn, ujævnhed " + terrainRoughness.value + " procent");
    }
    function updateTerrainValue() {
      terrainValue.value = (Number(terrainRoughness.value) / 100).toFixed(2).replace(".", ",");
      terrainValue.textContent = terrainValue.value;
    }
    terrainRoughness.addEventListener("input", function () { updateTerrainValue(); generateTerrain(); });
    terrainGenerate.addEventListener("click", generateTerrain);
    window.addEventListener("resize", generateTerrain);
    updateTerrainValue();
    generateTerrain();
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

  var weatherCard = document.querySelector("[data-weather-card]");
  if (weatherCard) {
    var weatherScenarios = {
      sun: { symbol: "☀", title: "Sol og plads til en pause", copy: "En lys dag til at følge en ny tanke.", label: "Illustreret solskinsvejr" },
      rain: { symbol: "☂", title: "Regn og ro til fordybelse", copy: "En stille stund til at samle sine idéer.", label: "Illustreret regnvejr" },
      wind: { symbol: "➝", title: "Vind i en ny retning", copy: "Lad en frisk brise flytte lidt på planen.", label: "Illustreret blæsevejr" },
      snow: { symbol: "❄", title: "Sne og plads til pauser", copy: "Små skridt kan stadig føre langt.", label: "Illustreret snevejr" }
    };
    var weatherSymbol = document.querySelector("[data-weather-symbol]");
    var weatherTitle = document.querySelector("[data-weather-title]");
    var weatherCopy = document.querySelector("[data-weather-copy]");
    document.querySelectorAll("[data-weather-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        var scene = weatherScenarios[button.dataset.weatherChoice];
        if (!scene) return;
        weatherCard.dataset.weather = button.dataset.weatherChoice;
        weatherCard.setAttribute("aria-label", scene.label);
        weatherSymbol.textContent = scene.symbol;
        weatherTitle.textContent = scene.title;
        weatherCopy.textContent = scene.copy;
        document.querySelectorAll("[data-weather-choice]").forEach(function (choice) {
          choice.setAttribute("aria-pressed", String(choice === button));
        });
      });
    });
  }
})();
