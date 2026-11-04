// Invitation: opret og del en rigtig kalenderinvitation til en begivenhed.
// Hele invitationen (titel, start, varighed, valgfrit sted/note) kodes ind i
// URL'ens hash-fragment — intet sendes til eller gemmes på nogen server. Alle
// der åbner linket, kan se detaljerne og hente en rigtig .ics-fil, der virker
// i Google Kalender, Outlook, Apple Kalender m.fl.
(function () {
  "use strict";

  var STORAGE_KEY = "invitation-mine";
  var MAX_GEMTE = 20;

  var form = document.getElementById("invitation-form");
  var deling = document.querySelector("[data-invitation-share]");
  var visning = document.querySelector("[data-invitation-display]");
  var fejlvisning = document.querySelector("[data-invitation-error]");
  var mineBox = document.querySelector("[data-invitation-mine]");
  var mineListe = document.querySelector("[data-invitation-mine-list]");

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
    if (!data || typeof data.t !== "string" || typeof data.s !== "number" || !isFinite(data.s) ||
      typeof data.d !== "number" || !isFinite(data.d) || data.d <= 0) {
      throw new Error("Ugyldigt invitations-link");
    }
    return {
      titel: data.t,
      start: data.s,
      varighed: data.d,
      sted: typeof data.l === "string" ? data.l : "",
      note: typeof data.n === "string" ? data.n : ""
    };
  }

  function lavLink(invitation) {
    var kodet = tilBase64Url({
      t: invitation.titel,
      s: invitation.start,
      d: invitation.varighed,
      l: invitation.sted || undefined,
      n: invitation.note || undefined
    });
    return location.origin + location.pathname + "#f=" + kodet;
  }

  // ---------- Lokalt gemte invitationer (bekvemmelighed, ikke nødvendigt for deling) ----------

  function hentMine() {
    try {
      var v = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }

  function gemMin(invitation, link) {
    try {
      var mine = hentMine();
      mine.unshift({ titel: invitation.titel, start: invitation.start, link: link, oprettet: Date.now() });
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
      small.textContent = formatterDato(m.start);
      var div = document.createElement("div");
      div.appendChild(a);
      div.appendChild(small);
      li.appendChild(div);
      mineListe.appendChild(li);
    });
  }

  // ---------- Visning af en invitation (delt eller lige oprettet) ----------

  var formatter = new Intl.DateTimeFormat("da-DK", { dateStyle: "full", timeStyle: "short" });
  function formatterDato(ms) {
    try { return formatter.format(new Date(ms)); } catch (e) { return new Date(ms).toLocaleString("da-DK"); }
  }

  function formatterVarighed(minutter) {
    if (minutter >= 1440 && minutter % 1440 === 0) {
      var dage = minutter / 1440;
      return dage === 1 ? "hele dagen" : dage + " dage";
    }
    if (minutter % 60 === 0) {
      var timer = minutter / 60;
      return timer === 1 ? "1 time" : timer + " timer";
    }
    if (minutter < 60) return minutter + " minutter";
    return Math.floor(minutter / 60) + "t " + (minutter % 60) + "m";
  }

  function visInvitation(invitation, link) {
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

    visning.querySelector("[data-invitation-title]").textContent = invitation.titel;
    visning.querySelector("[data-invitation-when]").textContent =
      formatterDato(invitation.start) + " · varighed " + formatterVarighed(invitation.varighed);

    var stedEl = visning.querySelector("[data-invitation-where]");
    if (invitation.sted) { stedEl.textContent = "📍 " + invitation.sted; stedEl.hidden = false; }
    else { stedEl.hidden = true; }

    var noteEl = visning.querySelector("[data-invitation-note]");
    if (invitation.note) { noteEl.textContent = invitation.note; noteEl.hidden = false; }
    else { noteEl.hidden = true; }

    var downloadStatus = visning.querySelector("[data-download-status]");
    if (downloadStatus) downloadStatus.textContent = "";

    var downloadKnap = visning.querySelector("[data-download-ics]");
    if (downloadKnap) {
      downloadKnap.onclick = function () {
        hentIcsFil(invitation);
        if (downloadStatus) downloadStatus.textContent = "Kalenderfilen er klar til at åbne eller gemme.";
      };
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
    var titelFelt = document.getElementById("invitation-title");
    if (titelFelt) titelFelt.focus();
  }

  // ---------- .ics-generering (samme mønster som legeplads.html eksperiment #110) ----------

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

  function hentIcsFil(invitation) {
    var start = new Date(invitation.start);
    var slut = new Date(invitation.start + invitation.varighed * 60 * 1000);
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    var uid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    var lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Villads Claes//Invitation//DA",
      "CALSCALE:GREGORIAN", "BEGIN:VEVENT", "UID:" + uid + "@villadsclaes.dk",
      "DTSTAMP:" + stamp, "DTSTART:" + icsDate(start), "DTEND:" + icsDate(slut),
      "SUMMARY:" + escapeIcs(invitation.titel)
    ];
    if (invitation.sted) lines.push("LOCATION:" + escapeIcs(invitation.sted));
    if (invitation.note) lines.push("DESCRIPTION:" + escapeIcs(invitation.note));
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
  }

  // ---------- Opret-formular ----------

  function initForm() {
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var statusEl = form.querySelector("[data-form-status]");
      var titel = document.getElementById("invitation-title").value.trim();
      var dato = document.getElementById("invitation-date").value;
      var tid = document.getElementById("invitation-time").value || "00:00";
      var varighed = Number(document.getElementById("invitation-duration").value) || 60;
      var sted = document.getElementById("invitation-location").value.trim();
      var note = document.getElementById("invitation-note").value.trim();

      if (!titel) { statusEl.textContent = "Skriv venligst en titel."; return; }
      if (!dato) { statusEl.textContent = "Vælg venligst en dato."; return; }

      var dele = dato.split("-").map(Number);
      var tidDele = tid.split(":").map(Number);
      var start = new Date(dele[0], dele[1] - 1, dele[2], tidDele[0] || 0, tidDele[1] || 0, 0, 0);
      if (isNaN(start.getTime())) { statusEl.textContent = "Datoen kunne ikke læses. Prøv igen."; return; }

      var invitation = { titel: titel, start: start.getTime(), varighed: varighed, sted: sted, note: note };
      var link = lavLink(invitation);
      gemMin(invitation, link);
      statusEl.textContent = "";

      history.replaceState(null, "", link);
      visInvitation(invitation, link);
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
        navigator.share({ title: "En invitation", url: linkFelt.value }).catch(function () {});
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
      if (delt) { visInvitation(delt, location.href); return; }
    } catch (e) {
      visFejl();
      return;
    }
    visOpretForm();
  }

  init();
})();
