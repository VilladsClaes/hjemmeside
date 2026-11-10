"use strict";

// Live afstand til besøgende: Villads' telefon rapporterer sin GPS-position
// via OwnTracks (HTTP-mode) til "reportLocation". Besøgende på hjemmesiden
// kan derefter — efter eget samtykke — dele deres egen placering med
// "getDistanceToVisitor", som beregner afstanden SERVER-SIDE og kun
// returnerer selve afstanden. Villads' (og besøgendes) koordinater sendes
// aldrig til klienten og gemmes aldrig andre steder end her.

const crypto = require("crypto");
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const params = require("./lib/params");

const EARTH_RADIUS_M = 6371000;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Haversine-afstand mellem to punkter, i meter. */
function haversineMeters(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

function isValidLat(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLon(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= -180 && value <= 180;
}

/** Konstant-tid-sammenligning af token, så det ikke kan gættes via timing. */
function tokensMatch(provided, expected) {
  if (typeof provided !== "string" || typeof expected !== "string" || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Modtager OwnTracks' HTTP-mode POST (https://owntracks.org/booklet/tech/json/).
 * En typisk "location"-besked ser sådan ud:
 *   { "_type": "location", "lat": 56.15, "lon": 10.21, "tst": 1699999999, ... }
 * Beskyttet af en hemmelig token i query-strengen (?token=...), fordi
 * OwnTracks' app-opsætning kun lader dig angive én URL (ingen brugerdefineret
 * header), og det er derfor det nemmeste at sætte op robust på tværs af
 * iOS/Android.
 */
const reportLocation = onRequest({ secrets: [params.LOCATION_REPORT_TOKEN] }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Kun POST er tilladt.");
    return;
  }

  const providedToken = req.query.token;
  if (!tokensMatch(typeof providedToken === "string" ? providedToken : "", params.LOCATION_REPORT_TOKEN.value())) {
    res.status(401).send("Ugyldig eller manglende token.");
    return;
  }

  const body = req.body || {};

  // OwnTracks sender også andre beskedtyper (lwt, waypoints, status, ...).
  // Dem gemmer vi ikke, men svarer alligevel pænt, så appen ikke fejler.
  if (body._type !== "location" || !isValidLat(body.lat) || !isValidLon(body.lon)) {
    res.status(200).json([]);
    return;
  }

  const deviceTimestamp =
    typeof body.tst === "number" && Number.isFinite(body.tst) ? Timestamp.fromMillis(body.tst * 1000) : null;

  await getFirestore()
    .collection("location")
    .doc("current")
    .set(
      {
        lat: body.lat,
        lon: body.lon,
        accuracyMeters: typeof body.acc === "number" && Number.isFinite(body.acc) ? body.acc : null,
        deviceTimestamp,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  // OwnTracks' HTTP-mode forventer et JSON-array som svar (typisk brugt til
  // fjernkommandoer/cards); en tom liste betyder "intet at rapportere".
  res.status(200).json([]);
});

/**
 * Kaldes fra besøgendes browser (efter samtykke til geolocation). Modtager
 * KUN besøgendes egne koordinater, henter Villads' seneste position via
 * Admin SDK (uden om Firestore-reglerne), og returnerer KUN afstanden.
 */
const getDistanceToVisitor = onCall(async (request) => {
  const { lat, lng } = request.data || {};
  if (!isValidLat(lat) || !isValidLon(lng)) {
    throw new HttpsError("invalid-argument", "Ugyldig placering.");
  }

  const snap = await getFirestore().collection("location").doc("current").get();
  if (!snap.exists) {
    return { status: "unavailable" };
  }

  const data = snap.data();
  const updatedAt = data.updatedAt;
  if (!updatedAt || typeof updatedAt.toMillis !== "function") {
    return { status: "unavailable" };
  }

  const ageMinutes = (Date.now() - updatedAt.toMillis()) / 60000;
  const maxAgeMinutes = Number(params.MAX_LOCATION_AGE_MINUTES.value()) || 30;
  if (ageMinutes > maxAgeMinutes) {
    return { status: "stale", updatedMinutesAgo: Math.round(ageMinutes) };
  }

  if (!isValidLat(data.lat) || !isValidLon(data.lon)) {
    return { status: "unavailable" };
  }

  const distanceMeters = haversineMeters(lat, lng, data.lat, data.lon);
  return {
    status: "ok",
    distanceMeters: Math.round(distanceMeters),
    updatedMinutesAgo: Math.max(0, Math.round(ageMinutes)),
  };
});

module.exports = { reportLocation, getDistanceToVisitor };
