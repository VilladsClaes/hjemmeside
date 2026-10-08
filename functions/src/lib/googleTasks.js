"use strict";

// Fallback-klient til Google Tasks API. Bruges kun hvis ACTIVE_PROVIDER er
// sat til "google" (se functions/.env.example), fx hvis opsætning af
// Microsoft Graph for private Microsoft-konti viser sig for besværlig.

const { google } = require("googleapis");

function makeOAuthClient({ clientId, clientSecret, redirectUri }) {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function authorizeUrl({ clientId, clientSecret, redirectUri, state }) {
  const client = makeOAuthClient({ clientId, clientSecret, redirectUri });
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // sikrer at vi altid får en refresh_token retur
    scope: ["https://www.googleapis.com/auth/tasks"],
    state,
  });
}

async function exchangeCodeForTokens({ clientId, clientSecret, redirectUri, code }) {
  const client = makeOAuthClient({ clientId, clientSecret, redirectUri });
  const { tokens } = await client.getToken(code);
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expiry_date,
  };
}

async function clientFor(stored, opts) {
  const client = makeOAuthClient(opts);
  client.setCredentials({
    access_token: stored.accessToken,
    refresh_token: stored.refreshToken,
    expiry_date: stored.expiresAt,
  });
  return client;
}

/** Henter en gyldig access token; googleapis fornyer selv ved behov. */
async function ensureFreshToken(stored, opts) {
  const client = await clientFor(stored, opts);
  const { token } = await client.getAccessToken();
  const credentials = client.credentials;
  return {
    ...stored,
    accessToken: token || stored.accessToken,
    refreshToken: credentials.refresh_token || stored.refreshToken,
    expiresAt: credentials.expiry_date || stored.expiresAt,
  };
}

async function tasksApiFor(stored, opts) {
  const client = await clientFor(stored, opts);
  return google.tasks({ version: "v1", auth: client });
}

async function ensureList(stored, opts, listTitle) {
  const tasksApi = await tasksApiFor(stored, opts);
  const { data } = await tasksApi.tasklists.list({ maxResults: 100 });
  const found = (data.items || []).find((list) => list.title === listTitle);
  if (found) return found.id;
  const created = await tasksApi.tasklists.insert({ requestBody: { title: listTitle } });
  return created.data.id;
}

async function createTask(stored, opts, listId, { title, description }) {
  const tasksApi = await tasksApiFor(stored, opts);
  const { data } = await tasksApi.tasks.insert({
    tasklist: listId,
    requestBody: { title, notes: description || undefined },
  });
  return data.id;
}

async function updateTaskNotes(stored, opts, listId, taskId, description) {
  const tasksApi = await tasksApiFor(stored, opts);
  await tasksApi.tasks.patch({
    tasklist: listId,
    task: taskId,
    requestBody: { notes: description },
  });
}

async function deleteTask(stored, opts, listId, taskId) {
  const tasksApi = await tasksApiFor(stored, opts);
  await tasksApi.tasks.delete({ tasklist: listId, task: taskId });
}

/**
 * Google Tasks API understøtter ikke delta-queries som Microsoft Graph, så
 * vi poller i stedet med "updatedMin" siden sidste synkroniseringstidspunkt.
 */
async function fetchChangedSince(stored, opts, listId, sinceMs) {
  const tasksApi = await tasksApiFor(stored, opts);
  const { data } = await tasksApi.tasks.list({
    tasklist: listId,
    showCompleted: true,
    showHidden: true,
    updatedMin: new Date(sinceMs || 0).toISOString(),
  });
  return data.items || [];
}

module.exports = {
  authorizeUrl,
  exchangeCodeForTokens,
  ensureFreshToken,
  ensureList,
  createTask,
  updateTaskNotes,
  deleteTask,
  fetchChangedSince,
};
