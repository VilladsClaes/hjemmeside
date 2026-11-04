// Nedtælling: opret og del en rigtig nedtælling til en bestemt dato.
// Hele nedtællingen (titel, måltidspunkt, valgfri note) kodes ind i URL'ens
// hash-fragment — intet sendes til eller gemmes på nogen server. Alle der
// åbner linket, regner selv nedtællingen ud lokalt, så den opdateres live
// uden nogen backend eller delt tilstand.
(function () {
  "use strict";

  var STORAGE_KEY = "nedtaelling-mine";
  var MAX_GEMTE = 20;

  var form = document.getElementById("countdown-form");
  var deling = document.querySelector("[data-countdown-share]");
  var visning = document.querySelector("[data-countdown-display]");
  var fejlvisning = document.querySelector("[data-countdown-error]");
  var mineBox = document.querySelector("[data-countdown-mine]");
  var mineListe = document.querySelector("[data-countdown-mine-list]");

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
    if (!data || typeof data.t !== "string" || typeof data.e !== "number" || !isFinite(data.e)) {
      throw new Error("Ugyldigt nedtællings-link");
    }
    return { titel: data.t, slut: data.e, note: typeof data.n === "string" ? data.n : "" };
  }

  function lavLink(nedtaelling) {
    var kodet = tilBase64Url({ t: nedtaelling.titel, e: nedtaelling.slut, n: nedtaelling.note || undefined });
    return location.origin + location.pathname + "#f=" + kodet;
  }

  // ---------- Lokalt gemte nedtællinger (bekvemmelighed, ikke nødvendigt for deling) ----------

  function hentMine() {
    try {
      var v = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function gemMin(nedtaelling, link) {
    try {
      var mine = hentMine();
      mine.unshift({ titel: nedtaelling.titel, slut: nedtaelling.slut, link: link, oprettet: Date.now() });
      mine = mine.slice(0, MAX_GEMTE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mine));
    } catch (e) {}
  }

  function tegnMine() {
    var mine = hentMine();
    if (!mineBox || !mineListe) return;
    if (mine.length === 0) { mineBox.hidden = true; return; }
    mineBox.hidden = false;
    mineListe.replaceChildren();
    mine.forEach(function (m) {
      var li = document.createElement("li");
      li.className = "countdown-mine-item";
      var a = document.createElement("a");
      a.href = m.link;
      a.textContent = m.titel;
      var small = document.createElement("small");
      small.textContent = formatterDato(m.slut);
      var div = document.createElement("div");
      div.appendChild(a);
      div.appendChild(small);
      li.appendChild(div);
      mineListe.appendChild(li);
    });
  }

  // ---------- Visning af en nedtælling (delt eller lige oprettet) ----------

  var formatter = new Intl.DateTimeFormat("da-DK", { dateStyle: "full", timeStyle: "short" });
  function formatterDato(ms) {
    try { return formatter.format(new Date(ms)); } catch (e) { return new Date(ms).toLocaleString("da-DK"); }
  }

  function to(n) { return (n < 10 ? "0" : "") + n; }

  var tikInterval = null;

  function visNedtaelling(nedtaelling, link) {
    if (!visning) return;
    form.hidden = true;
    fejlvisning.hidden = true;
    mineBox.hidden = true;
    visning.hidden = false;

    if (link) {
      deling.querySelector("[data-share-link]").value = link;
      deling.hidden = false;
    } else {
      deling.hidden = true;
    }

    visning.querySelector("[data-countdown-title]").textContent = nedtaelling.titel;
    visning.querySelector("[data-countdown-target]").textContent = formatterDato(nedtaelling.slut);
    var noteEl = visning.querySelector("[data-countdown-note]");
    if (nedtaelling.note) { noteEl.textContent = nedtaelling.note; noteEl.hidden = false; }
    else { noteEl.hidden = true; }

    var felter = {};
    visning.querySelectorAll("[data-unit]").forEach(function (el) { felter[el.dataset.unit] = el; });
    var status = visning.querySelector("[data-countdown-status]");

    function tik() {
      var diff = nedtaelling.slut - Date.now();
      var forbi = diff <= 0;
      var rest = Math.abs(diff);
      var dage = Math.floor(rest / 86400000);
      var timer = Math.floor((rest % 86400000) / 3600000);
      var minutter = Math.floor((rest % 3600000) / 60000);
      var sekunder = Math.floor((rest % 60000) / 1000);
      felter.d.textContent = to(dage);
      felter.t.textContent = to(timer);
      felter.m.textContent = to(minutter);
      felter.s.textContent = to(sekunder);
      visning.classList.toggle("is-done", forbi);
      if (forbi) {
        status.textContent = (dage === 0 && timer === 0 && minutter === 0 && sekunder === 0)
          ? "Tiden er inde — lige nu!"
          : "Det var for " + dage + "d " + timer + "t " + minutter + "m siden.";
      } else {
        status.textContent = "Nedtællingen kører.";
      }
    }
    tik();
    clearInterval(tikInterval);
    tikInterval = setInterval(tik, 1000);
  }

  function visFejl() {
    form.hidden = false;
    deling.hidden = true;
    visning.hidden = true;
    fejlvisning.hidden = false;
    tegnMine();
  }

  function visOpretForm() {
    clearInterval(tikInterval);
    form.hidden = false;
    deling.hidden = true;
    visning.hidden = true;
    fejlvisning.hidden = true;
    history.replaceState(null, "", location.pathname);
    tegnMine();
    var titelFelt = document.getElementById("countdown-title");
    if (titelFelt) titelFelt.focus();
  }

  // ---------- Opret-formular ----------

  function initForm() {
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var statusEl = form.querySelector("[data-form-status]");
      var titel = document.getElementById("countdown-title").value.trim();
      var dato = document.getElementById("countdown-date").value;
      var tid = document.getElementById("countdown-time").value || "00:00";
      var note = document.getElementById("countdown-note").value.trim();

      if (!titel) { statusEl.textContent = "Skriv venligst en titel."; return; }
      if (!dato) { statusEl.textContent = "Vælg venligst en dato."; return; }

      var dele = dato.split("-").map(Number);
      var tidDele = tid.split(":").map(Number);
      var maal = new Date(dele[0], dele[1] - 1, dele[2], tidDele[0] || 0, tidDele[1] || 0, 0, 0);
      if (isNaN(maal.getTime())) { statusEl.textContent = "Datoen kunne ikke læses. Prøv igen."; return; }

      var nedtaelling = { titel: titel, slut: maal.getTime(), note: note };
      var link = lavLink(nedtaelling);
      gemMin(nedtaelling, link);
      statusEl.textContent = "";

      history.replaceState(null, "", link);
      visNedtaelling(nedtaelling, link);
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
        navigator.share({ title: "En nedtælling", url: linkFelt.value }).catch(function () {});
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
      if (delt) { visNedtaelling(delt, location.href); return; }
    } catch (e) {
      visFejl();
      return;
    }
    visOpretForm();
  }

  init();
})();
