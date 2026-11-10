// Live afstand til besøgende: besøgende kan — efter eget samtykke — dele sin
// placering med browseren, som sender den videre til en Cloud Function
// ("getDistanceToVisitor"). Funktionen slår Villads' seneste GPS-position op
// server-side og returnerer KUN afstanden. Hverken besøgendes eller Villads'
// koordinater forlader nogensinde serveren i klartekst til den anden part.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js";

const btn = document.querySelector("[data-distance-btn]");
const resultEl = document.querySelector("[data-distance-result]");
const statusEl = document.querySelector("[data-distance-status]");

if (btn && resultEl && statusEl) {
  btn.addEventListener("click", handleClick);
}

function setStatus(message) {
  statusEl.textContent = message || "";
}

function showResult(message) {
  resultEl.textContent = message;
  resultEl.hidden = !message;
}

function formatDistance(meters) {
  if (meters < 1000) {
    const rounded = Math.max(0, Math.round(meters));
    return `Jeg er ${rounded.toLocaleString("da-DK")} meter fra dig.`;
  }
  const km = (meters / 1000).toLocaleString("da-DK", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `Jeg er ${km} km fra dig.`;
}

function formatAge(minutes) {
  if (minutes <= 1) return "Opdateret for under et minut siden.";
  return `Opdateret for ${minutes} minutter siden.`;
}

async function handleClick() {
  if (!window.FIREBASE_CONFIG || window.FIREBASE_CONFIG.apiKey === "UDFYLD-DIN-API-KEY") {
    setStatus("Funktionen er ikke sat op endnu.");
    return;
  }
  if (!("geolocation" in navigator)) {
    setStatus("Din browser understøtter ikke geolocation.");
    return;
  }

  btn.disabled = true;
  showResult("");
  setStatus("Henter din placering …");

  try {
    const position = await getCurrentPosition();
    setStatus("Beregner afstanden …");

    const app = initializeApp(window.FIREBASE_CONFIG);
    const region = window.FIREBASE_FUNCTIONS_REGION || "us-central1";
    const functions = getFunctions(app, region);
    const getDistanceToVisitor = httpsCallable(functions, "getDistanceToVisitor");

    const { data } = await getDistanceToVisitor({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });

    if (data.status === "ok") {
      showResult(formatDistance(data.distanceMeters));
      setStatus(formatAge(data.updatedMinutesAgo));
    } else if (data.status === "stale") {
      setStatus(`Jeg ved ikke lige hvor jeg er for øjeblikket (${formatAge(data.updatedMinutesAgo).toLowerCase()})`);
    } else {
      setStatus("Jeg deler ikke min position lige nu. Prøv igen senere.");
    }
  } catch (err) {
    setStatus(geolocationErrorMessage(err));
  } finally {
    btn.disabled = false;
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

function geolocationErrorMessage(err) {
  if (err && typeof err.code === "number") {
    if (err.code === err.PERMISSION_DENIED) return "Du har ikke givet adgang til din placering.";
    if (err.code === err.POSITION_UNAVAILABLE) return "Kunne ikke finde din placering lige nu.";
    if (err.code === err.TIMEOUT) return "Det tog for lang tid at finde din placering. Prøv igen.";
  }
  return "Kunne ikke hente afstanden lige nu. Prøv igen senere.";
}
