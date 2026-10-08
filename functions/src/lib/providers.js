"use strict";

// Fælles indgang til den aktive opgave-udbyder (Microsoft To Do som primær,
// Google Tasks som fallback). Al logik, der skal vide HVILKEN udbyder der er
// aktiv, går igennem denne fil, så approvals.js og scheduled.js ikke selv
// skal forholde sig til forskellen.

const msGraph = require("./msGraph");
const googleTasks = require("./googleTasks");
const { loadTokens, saveTokens } = require("./tokenStore");
const params = require("./params");

function activeProviderName() {
  const value = params.ACTIVE_PROVIDER.value();
  return value === "google" ? "google" : "microsoft";
}

function msOpts() {
  return {
    tenant: params.MS_TENANT.value(),
    clientId: params.MS_CLIENT_ID.value(),
    clientSecret: params.MS_CLIENT_SECRET.value(),
  };
}

function googleOpts() {
  return {
    clientId: params.GOOGLE_CLIENT_ID.value(),
    clientSecret: params.GOOGLE_CLIENT_SECRET.value(),
    redirectUri: params.GOOGLE_REDIRECT_URI.value(),
  };
}

function encryptionKey() {
  return params.TOKEN_ENCRYPTION_KEY.value();
}

async function loadAndRefresh(provider) {
  const stored = await loadTokens(provider, encryptionKey());
  if (!stored) {
    throw new Error(
      `Ingen gemt forbindelse til "${provider}" endnu. Forbind kontoen via ` +
        `/${provider === "microsoft" ? "msOauthStart" : "googleOauthStart"} først.`
    );
  }
  const fresh =
    provider === "microsoft"
      ? await msGraph.ensureFreshToken(stored, msOpts())
      : await googleTasks.ensureFreshToken(stored, googleOpts());
  await saveTokens(provider, fresh, encryptionKey());
  return fresh;
}

/** Opretter en ny opgave hos den aktive udbyder og returnerer dens fjern-id. */
async function pushNewTask({ title, description }) {
  const provider = activeProviderName();
  const tokens = await loadAndRefresh(provider);
  if (provider === "microsoft") {
    const listId = tokens.listId || (await msGraph.ensureList(tokens.accessToken, params.MS_LIST_NAME.value()));
    if (!tokens.listId) await saveTokens(provider, { ...tokens, listId }, encryptionKey());
    const remoteId = await msGraph.createTask(tokens.accessToken, listId, { title, description });
    return { provider, listId, remoteId };
  }
  const listId = tokens.listId || (await googleTasks.ensureList(tokens, googleOpts(), params.GOOGLE_LIST_TITLE.value()));
  if (!tokens.listId) await saveTokens(provider, { ...tokens, listId }, encryptionKey());
  const remoteId = await googleTasks.createTask(tokens, googleOpts(), listId, { title, description });
  return { provider, listId, remoteId };
}

/** Opdaterer beskrivelsen (fx med ny ansvarlig/kontaktperson) på en opgave. */
async function pushDescriptionUpdate({ provider, listId, remoteId, description }) {
  const tokens = await loadAndRefresh(provider);
  if (provider === "microsoft") {
    await msGraph.updateTaskBody(tokens.accessToken, listId, remoteId, description);
  } else {
    await googleTasks.updateTaskNotes(tokens, googleOpts(), listId, remoteId, description);
  }
}

module.exports = {
  activeProviderName,
  msOpts,
  googleOpts,
  encryptionKey,
  loadAndRefresh,
  pushNewTask,
  pushDescriptionUpdate,
};
