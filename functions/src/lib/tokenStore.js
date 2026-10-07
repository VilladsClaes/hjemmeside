"use strict";

const { getFirestore } = require("firebase-admin/firestore");
const { encrypt, decrypt } = require("./crypto");

/**
 * Gemmer og henter provider-tokens (Microsoft/Google) i Firestore-dokumentet
 * config/{provider}. Kun tilgængeligt fra Cloud Functions (Admin SDK) —
 * Firestore-reglerne blokerer al klientadgang til "config"-collectionen.
 */
async function saveTokens(provider, tokens, encryptionKeyHex) {
  const db = getFirestore();
  const payload = {
    accessToken: encrypt(tokens.accessToken, encryptionKeyHex),
    refreshToken: encrypt(tokens.refreshToken, encryptionKeyHex),
    expiresAt: tokens.expiresAt,
    updatedAt: Date.now(),
  };
  if (tokens.listId) payload.listId = tokens.listId;
  if (tokens.deltaLink) payload.deltaLink = tokens.deltaLink;
  if (tokens.lastSyncMs) payload.lastSyncMs = tokens.lastSyncMs;
  await db.collection("config").doc(provider).set(payload, { merge: true });
}

async function loadTokens(provider, encryptionKeyHex) {
  const db = getFirestore();
  const snap = await db.collection("config").doc(provider).get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (!data.accessToken || !data.refreshToken) return null;
  return {
    accessToken: decrypt(data.accessToken, encryptionKeyHex),
    refreshToken: decrypt(data.refreshToken, encryptionKeyHex),
    expiresAt: data.expiresAt,
    listId: data.listId || null,
    deltaLink: data.deltaLink || null,
    lastSyncMs: data.lastSyncMs || null,
  };
}

async function updateSyncState(provider, fields) {
  const db = getFirestore();
  await db.collection("config").doc(provider).set(fields, { merge: true });
}

module.exports = { saveTokens, loadTokens, updateSyncState };
