// Replik: skriv en kort tegneserie-replik i en taleboble, og del den som et
// rigtigt link. Bobleform og replik-tekst kodes som base64url JSON i URL'ens
// hash-fragment — intet sendes til eller gemmes på nogen server. Alle der
// åbner linket, ser præcis den samme taleboble, helt lokalt i browseren.
(function () {
  "use strict";

  var GYLDIGE_FORMER = ["talk", "whisper", "burst"];

  var form = document.getElementById("replik-form");
  var deling = document.querySelector("[data-replik-share]");
  var visning = document.querySelector("[data-replik-display]");
  var fejlvisning = document.querySelector("[data-replik-error]");

  // ---------- Kodning: UTF-8-sikker base64url i URL'ens hash ----------

  function tilBase64Url(data) {
    var json = JSON.stringify(data);
    var bytes = new TextEncoder().encode(json);
    var binaer = "";
    bytes.forEach(function (b) { binaer += String.fromCharCode(b); });
    return btoa(binaer).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function fraBase64Url(str) {
    var base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    var padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    var binaer = atob(base64 + padding);
    var bytes = new Uint8Array(binaer.length);
    for (var i = 0; i < binaer.length; i++) bytes[i] = binaer.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function laesHash() {
    var raw = location.hash.replace(/^#/, "");
    if (!raw) return null;
    var params = new URLSearchParams(raw);
    var f = params.get("f");
    if (!f) return null;
    var data = fraBase64Url(f);
    if (!data || GYLDIGE_FORMER.indexOf(data.f) === -1 || typeof data.t !== "string" || !data.t.trim()) {
      throw new Error("Ugyldigt replik-link");
    }
    return { form: data.f, tekst: data.t };
  }

  function lavLink(replik) {
    var kodet = tilBase64Url({ f: replik.form, t: replik.tekst });
    return location.origin + location.pathname + "#f=" + kodet;
  }

  // ---------- Live forhåndsvisning i opret-formularen ----------

  var preview = form.querySelector("[data-replik-preview]");
  var previewCopy = form.querySelector("[data-replik-preview-copy]");
  var textInput = document.getElementById("replik-text");
  var valgtForm = "talk";

  function opdaterPreview() {
    preview.dataset.bubbleShape = valgtForm;
    previewCopy.textContent = textInput.value.trim() || "Skriv en lille replik.";
  }

  form.querySelectorAll("[data-bubble-shape]").forEach(function (knap) {
    knap.addEventListener("click", function () {
      valgtForm = knap.dataset.bubbleShape;
      form.querySelectorAll(".bubble-shape-controls [data-bubble-shape]").forEach(function (choice) {
        choice.setAttribute("aria-pressed", String(choice === knap));
      });
      opdaterPreview();
    });
  });
  textInput.addEventListener("input", opdaterPreview);
  opdaterPreview();

  // ---------- Visning af en delt replik ----------

  function visReplik(replik, link) {
    form.hidden = true;
    fejlvisning.hidden = true;
    visning.hidden = false;

    var bubbel = visning.querySelector("[data-replik-display-bubble]");
    bubbel.dataset.bubbleShape = replik.form;
    visning.querySelector("[data-replik-display-copy]").textContent = replik.tekst;

    if (link) {
      deling.querySelector("[data-share-link]").value = link;
      deling.hidden = false;
    } else {
      deling.hidden = true;
    }
  }

  function visFejl() {
    form.hidden = false;
    deling.hidden = true;
    visning.hidden = true;
    fejlvisning.hidden = false;
  }

  function visOpretForm() {
    form.hidden = false;
    deling.hidden = true;
    visning.hidden = true;
    fejlvisning.hidden = true;
    history.replaceState(null, "", location.pathname);
    textInput.focus();
  }

  // ---------- Opret-formular ----------

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var statusEl = form.querySelector("[data-form-status]");
    var tekst = textInput.value.trim();

    if (!tekst) { statusEl.textContent = "Skriv venligst en replik."; return; }

    var replik = { form: valgtForm, tekst: tekst };
    var link = lavLink(replik);
    statusEl.textContent = "";

    history.replaceState(null, "", link);
    visReplik(replik, link);
  });

  // ---------- Deling af linket ----------

  function initDeling() {
    var linkFelt = document.querySelector("[data-share-link]");
    var kopierKnap = document.querySelector("[data-copy-link]");
    var delKnap = document.querySelector("[data-share-native]");
    var kopierStatus = document.querySelector("[data-copy-status]");

    if (kopierKnap) {
      kopierKnap.addEventListener("click", function () {
        var link = linkFelt.value;
        var faerdig = function () { kopierStatus.textContent = "Linket er kopieret!"; };
        var fejl = function () {
          linkFelt.select();
          try { document.execCommand("copy"); faerdig(); }
          catch (e) { kopierStatus.textContent = "Kunne ikke kopiere automatisk — marker og kopiér linket manuelt."; }
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(link).then(faerdig, fejl);
        } else {
          fejl();
        }
      });
    }

    if (delKnap && navigator.share) {
      delKnap.hidden = false;
      delKnap.addEventListener("click", function () {
        navigator.share({ title: "En lille replik", url: linkFelt.value }).catch(function () {});
      });
    }
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-make-own]")) visOpretForm();
  });

  function init() {
    initDeling();
    try {
      var delt = laesHash();
      if (delt) { visReplik(delt, location.href); return; }
    } catch (e) {
      visFejl();
      return;
    }
    visOpretForm();
  }

  init();
})();
