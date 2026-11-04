// Citat-generator: skriv et citat, vælg et tema, og tegn det på et <canvas>,
// så det kan hentes som et rigtigt PNG-billede. Alt sker lokalt i browseren —
// intet sendes til eller gemmes på nogen server.
(function () {
  "use strict";

  var builder = document.querySelector(".quote-builder");
  if (!builder) return;

  var canvas = builder.querySelector(".quote-canvas");
  var textInput = builder.querySelector(".quote-text-input");
  var authorInput = builder.querySelector(".quote-author-input");
  var countOutput = builder.querySelector(".quote-count");
  var status = builder.querySelector(".quote-status");
  var downloadButton = builder.querySelector(".quote-download");
  var ctx = canvas.getContext && canvas.getContext("2d");

  if (!ctx) {
    if (status) status.textContent = "Canvas understøttes ikke i denne browser.";
    if (downloadButton) downloadButton.disabled = true;
    return;
  }

  var size = canvas.width; // kvadratisk canvas (1080x1080)
  var maxLength = textInput.getAttribute("maxlength") || "240";

  // ---------- Temaer: baggrund, tekstfarve og en dæmpet accentfarve ----------

  var TEMAER = {
    papir: { navn: "Papir", baggrund: ["#f6f4ef"], tekst: "#1f2a33", accent: "#2f5d73", meta: "#5b6770" },
    fjord: { navn: "Fjord", baggrund: ["#1f2a33", "#2f5d73"], tekst: "#ffffff", accent: "#fbefd6", meta: "#cfe0e8" },
    sol: { navn: "Sol", baggrund: ["#fbefd6", "#f0b44c"], tekst: "#2a2117", accent: "#2f5d73", meta: "#5b4a28" },
    sage: { navn: "Sage", baggrund: ["#e3ebe2", "#7d9a80"], tekst: "#1f2a33", accent: "#ffffff", meta: "#36473c" },
    tyttebaer: { navn: "Tyttebær", baggrund: ["#f7e2dc", "#cf6f58"], tekst: "#2a1b16", accent: "#ffffff", meta: "#5c3b30" },
    nat: { navn: "Nat", baggrund: ["#12181d"], tekst: "#f6f4ef", accent: "#f0b44c", meta: "#9aa7b0" }
  };

  function valgtTema() {
    var input = builder.querySelector('input[name="quote-theme"]:checked');
    var key = input ? input.value : "papir";
    return TEMAER[key] || TEMAER.papir;
  }

  // ---------- Ordombrydning: Canvas API kan ikke selv bryde tekst om ----------

  function brydLinjer(tekst, maxBredde) {
    var ord = tekst.split(/\s+/).filter(Boolean);
    var linjer = [];
    var naevaerende = "";

    function tilfoejLangtOrd(langtOrd) {
      var del = "";
      for (var i = 0; i < langtOrd.length; i++) {
        var test = del + langtOrd[i];
        if (ctx.measureText(test).width > maxBredde && del) {
          linjer.push(del);
          del = langtOrd[i];
        } else {
          del = test;
        }
      }
      return del;
    }

    ord.forEach(function (ordet) {
      var test = naevaerende ? naevaerende + " " + ordet : ordet;
      if (ctx.measureText(test).width <= maxBredde) {
        naevaerende = test;
        return;
      }
      if (naevaerende) linjer.push(naevaerende);
      if (ctx.measureText(ordet).width > maxBredde) {
        naevaerende = tilfoejLangtOrd(ordet);
      } else {
        naevaerende = ordet;
      }
    });
    if (naevaerende) linjer.push(naevaerende);
    return linjer.length ? linjer : [""];
  }

  function findStoerrelseOgLinjer(tekst, maxBredde, maxHoejde, maxStr, minStr, vaegt) {
    var fontStr = maxStr;
    var linjer = [];
    while (fontStr >= minStr) {
      ctx.font = vaegt + " " + Math.round(fontStr) + "px 'Fraunces', Georgia, serif";
      linjer = brydLinjer(tekst, maxBredde);
      var linjeHoejde = fontStr * 1.32;
      if (linjer.length * linjeHoejde <= maxHoejde || fontStr <= minStr) break;
      fontStr -= 4;
    }
    return { stoerrelse: Math.max(fontStr, minStr), linjer: linjer };
  }

  // ---------- Tegning af kortet ----------

  function tegn() {
    var tema = valgtTema();
    var tekst = (textInput.value || "").trim() || "Skriv et citat for at se det her.";
    var forfatter = (authorInput.value || "").trim();

    ctx.clearRect(0, 0, size, size);

    // Baggrund: solid farve eller diagonal gradient, alt efter tema.
    if (tema.baggrund.length > 1) {
      var gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, tema.baggrund[0]);
      gradient.addColorStop(1, tema.baggrund[1]);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = tema.baggrund[0];
    }
    ctx.fillRect(0, 0, size, size);

    // Dekorativt citationstegn øverst til venstre.
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = tema.accent;
    ctx.font = "700 " + Math.round(size * 0.22) + "px 'Fraunces', Georgia, serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("\u201C", size * 0.08, size * 0.28);
    ctx.restore();

    // Citatteksten: find en skriftstørrelse, der gør, at teksten passer.
    var maxTekstBredde = size * 0.78;
    var maxTekstHoejde = size * 0.46;
    var resultat = findStoerrelseOgLinjer(tekst, maxTekstBredde, maxTekstHoejde, size * 0.078, size * 0.032, "600");
    var linjeHoejde = resultat.stoerrelse * 1.32;
    var samletHoejde = resultat.linjer.length * linjeHoejde;
    var startY = size * 0.5 - samletHoejde / 2 + linjeHoejde * 0.78;

    ctx.fillStyle = tema.tekst;
    ctx.font = "600 " + Math.round(resultat.stoerrelse) + "px 'Fraunces', Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    resultat.linjer.forEach(function (linje, i) {
      ctx.fillText(linje, size / 2, startY + i * linjeHoejde, maxTekstBredde);
    });

    // Forfatter/signatur, hvis angivet.
    if (forfatter) {
      ctx.fillStyle = tema.meta;
      ctx.font = "500 " + Math.round(size * 0.032) + "px 'Inter', system-ui, sans-serif";
      ctx.fillText("— " + forfatter, size / 2, size * 0.86, maxTekstBredde);
    }

    status.textContent = "Tema: " + tema.navn + " — klar til at blive hentet.";
  }

  function opdaterTaeller() {
    if (!countOutput) return;
    countOutput.textContent = textInput.value.length + " / " + maxLength + " tegn";
  }

  textInput.addEventListener("input", function () {
    opdaterTaeller();
    tegn();
  });
  authorInput.addEventListener("input", tegn);
  builder.addEventListener("change", function (event) {
    if (event.target && event.target.name === "quote-theme") tegn();
  });

  if (downloadButton) {
    downloadButton.addEventListener("click", function () {
      canvas.toBlob(function (blob) {
        if (!blob) {
          status.textContent = "Billedet kunne ikke hentes — prøv igen.";
          return;
        }
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "mit-citat.png";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        status.textContent = "Dit citat-kort er hentet som mit-citat.png.";
      }, "image/png");
    });
  }

  opdaterTaeller();

  // Vent på, at Fraunces er indlæst, så første tegning bruger den rigtige skrifttype.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(tegn).catch(tegn);
  }
  tegn();
})();
