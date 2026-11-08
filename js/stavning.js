// Stavning: stav et navn eller ord med det danske stavealfabet, og del det.
// Selve ordet kodes som base64url-JSON i URL'ens hash-fragment — intet
// sendes til eller gemmes på nogen server. Alle der åbner linket, ser og kan
// høre præcis den samme stavning, uden selv at skulle skrive ordet ind.
(function () {
  "use strict";

  var STORAGE_KEY = "stavning-mine";
  var MAX_GEMTE = 20;
  var MAX_LAENGDE = 24;

  var DATA = window.VC_DATA || {};
  var ALFABET = (DATA.undervisning || {}).stavealfabet || {};

  var form = document.getElementById("stavning-form");
  var deling = document.querySelector("[data-stavning-share]");
  var visning = document.querySelector("[data-stavning-display]");
  var fejlvisning = document.querySelector("[data-stavning-error]");
  var mineBox = document.querySelector("[data-stavning-mine]");
  var mineListe = document.querySelector("[data-stavning-mine-list]");

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
    if (!data || typeof data.o !== "string" || !data.o.trim()) {
      throw new Error("Ugyldigt stavnings-link");
    }
    return { ord: data.o.slice(0, MAX_LAENGDE) };
  }

  function lavLink(ord) {
    var kodet = tilBase64Url({ o: ord });
    return location.origin + location.pathname + "#f=" + kodet;
  }

  // ---------- Lokalt gemte stavninger (bekvemmelighed, ikke nødvendigt for deling) ----------

  function hentMine() {
    try {
      var v = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function gemMin(ord, link) {
    try {
      var mine = hentMine().filter(function (m) { return m.ord !== ord; });
      mine.unshift({ ord: ord, link: link, oprettet: Date.now() });
      mine = mine.slice(0, MAX_GEMTE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mine));
    } catch (e) {}
  }

  function tegnMine() {
    if (!mineBox || !mineListe) return;
    var mine = hentMine();
    if (mine.length === 0) { mineBox.hidden = true; return; }
    mineBox.hidden = false;
    mineListe.replaceChildren();
    mine.forEach(function (m) {
      var li = document.createElement("li");
      li.className = "countdown-mine-item";
      var a = document.createElement("a");
      a.href = m.link;
      a.textContent = m.ord;
      var small = document.createElement("small");
      small.textContent = new Date(m.oprettet).toLocaleDateString("da-DK");
      var div = document.createElement("div");
      div.appendChild(a);
      div.appendChild(small);
      li.appendChild(div);
      mineListe.appendChild(li);
    });
  }

  // ---------- Tale ----------

  var kanTale = "speechSynthesis" in window;

  function sig(tekst) {
    if (!kanTale) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(tekst);
    u.lang = "da-DK";
    u.rate = .9;
    speechSynthesis.speak(u);
  }

  function hop(b) {
    b.classList.remove("is-bouncing");
    void b.offsetWidth;
    b.classList.add("is-bouncing");
  }

  // ---------- Visning af en stavning (delt eller lige oprettet) ----------

  function tegnStavning(ord) {
    var tegnene = Array.from(ord.toUpperCase()).filter(function (c) { return c.trim(); });
    var bogstaver = visning.querySelector("[data-stavning-letters]");
    var stavningTekst = visning.querySelector("[data-stavning-output]");
    bogstaver.replaceChildren.apply(bogstaver, tegnene.map(function (c) {
      var navn = ALFABET[c];
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", navn ? c + " som i " + navn : c);
      b.textContent = c;
      b.addEventListener("click", function () {
        hop(b);
        stavningTekst.textContent = navn ? c + " som i " + navn : c;
        sig(navn ? c + " som i " + navn : c);
      });
      b.addEventListener("animationend", function () { b.classList.remove("is-bouncing"); });
      return b;
    }));
    stavningTekst.textContent = tegnene.map(function (c) { return ALFABET[c] || c; }).join(" – ");

    var laesKnap = visning.querySelector("[data-read-all]");
    if (laesKnap) {
      laesKnap.hidden = !kanTale;
      laesKnap.onclick = function () {
        sig(tegnene.map(function (c) { return ALFABET[c] ? c + " som i " + ALFABET[c] : c; }).join(". "));
      };
    }
    var taleNote = visning.querySelector("[data-tale-note]");
    if (taleNote) {
      taleNote.textContent = kanTale ? "Klik på et bogstav for at høre det." : "Din browser kan ikke læse op, men stavningen står herover.";
    }
  }

  function visStavning(ord, link) {
    if (!visning) return;
    form.hidden = true;
    fejlvisning.hidden = true;
    mineBox.hidden = true;
    visning.hidden = false;

    visning.querySelector("[data-stavning-word]").textContent = ord;
    tegnStavning(ord);

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
    tegnMine();
  }

  function visOpretForm() {
    form.hidden = false;
    deling.hidden = true;
    visning.hidden = true;
    fejlvisning.hidden = true;
    history.replaceState(null, "", location.pathname);
    tegnMine();
    var ordFelt = document.getElementById("stavning-ord");
    if (ordFelt) ordFelt.focus();
  }

  // ---------- Opret-formular ----------

  function initForm() {
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var statusEl = form.querySelector("[data-form-status]");
      var ord = document.getElementById("stavning-ord").value.trim();

      if (!ord) { statusEl.textContent = "Skriv venligst et navn eller ord."; return; }
      ord = ord.slice(0, MAX_LAENGDE);

      var link = lavLink(ord);
      gemMin(ord, link);
      statusEl.textContent = "";

      history.replaceState(null, "", link);
      visStavning(ord, link);
    });
  }

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
        navigator.share({ title: "En stavning", url: linkFelt.value }).catch(function () {});
      });
    }
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-make-own]")) visOpretForm();
  });

  function init() {
    initForm();
    initDeling();
    try {
      var delt = laesHash();
      if (delt) { visStavning(delt.ord, location.href); return; }
    } catch (e) {
      visFejl();
      return;
    }
    visOpretForm();
  }

  init();
})();
