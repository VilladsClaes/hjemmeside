"use strict";

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const msGraph = require("./lib/msGraph");
const googleTasks = require("./lib/googleTasks");
const params = require("./lib/params");
const providers = require("./lib/providers");
const { saveTokens } = require("./lib/tokenStore");

const sharedSecrets = [params.TOKEN_ENCRYPTION_KEY, params.MS_CLIENT_SECRET, params.GOOGLE_CLIENT_SECRET];

/**
 * Henter ændringer fra den aktive udbyder (fuldført/omdøbt/slettet direkte i
 * Microsoft To Do eller Google Tasks) og afspejler dem i Firestore, så den
 * offentlige side altid viser den rigtige status. Kører hvert 15. minut.
 */
const pullTaskChanges = onSchedule(
  { schedule: "every 15 minutes", secrets: sharedSecrets },
  async () => {
    const provider = providers.activeProviderName();
    if (provider === "microsoft") {
      await pullFromMicrosoft();
    } else {
      await pullFromGoogle();
    }
  }
);

async function pullFromMicrosoft() {
  const db = getFirestore();
  const tokens = await providers.loadAndRefresh("microsoft");
  if (!tokens.listId) return; // endnu ikke forbundet/klar

  const { items, deltaLink } = await msGraph.fetchDelta(tokens.accessToken, tokens.listId, tokens.deltaLink);
  await saveTokens("microsoft", { ...tokens, deltaLink }, providers.encryptionKey());

  for (const item of items) {
    const existing = await db
      .collection("tasks")
      .where("provider", "==", "microsoft")
      .where("remoteTaskId", "==", item.id)
      .limit(1)
      .get();
    if (existing.empty) continue; // ikke en opgave vi kender/ejer (fx oprettet manuelt i To Do)
    const taskRef = existing.docs[0].ref;

    if (item["@removed"]) {
      await taskRef.delete();
      continue;
    }
    await taskRef.update({
      title: item.title || existing.docs[0].data().title,
      status: item.status === "completed" ? "done" : "open",
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

async function pullFromGoogle() {
  const db = getFirestore();
  const tokens = await providers.loadAndRefresh("google");
  if (!tokens.listId) return;

  const sinceMs = tokens.lastSyncMs || 0;
  const items = await googleTasks.fetchChangedSince(tokens, providers.googleOpts(), tokens.listId, sinceMs);
  await saveTokens("google", { ...tokens, lastSyncMs: Date.now() }, providers.encryptionKey());

  for (const item of items) {
    const existing = await db
      .collection("tasks")
      .where("provider", "==", "google")
      .where("remoteTaskId", "==", item.id)
      .limit(1)
      .get();
    if (existing.empty) continue;
    const taskRef = existing.docs[0].ref;

    if (item.deleted) {
      await taskRef.delete();
      continue;
    }
    await taskRef.update({
      title: item.title || existing.docs[0].data().title,
      status: item.status === "completed" ? "done" : "open",
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

module.exports = { pullTaskChanges };
