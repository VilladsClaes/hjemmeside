"use strict";

// Minimal klient til Microsoft Graph "To Do"-API'et (Microsoft To Do).
// Bruger kun global fetch (indbygget i Node 20) — ingen ekstra afhængighed.

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

function tokenEndpoint(tenant) {
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
}

function authorizeUrl({ tenant, clientId, redirectUri, state }) {
  const url = new URL(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", "offline_access Tasks.ReadWrite");
  url.searchParams.set("state", state);
  return url.toString();
}

async function exchangeCodeForTokens({ tenant, clientId, clientSecret, redirectUri, code }) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    scope: "offline_access Tasks.ReadWrite",
  });
  return requestToken(tenant, body);
}

async function refreshAccessToken({ tenant, clientId, clientSecret, refreshToken }) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: "offline_access Tasks.ReadWrite",
  });
  return requestToken(tenant, body);
}

async function requestToken(tenant, body) {
  const response = await fetch(tokenEndpoint(tenant), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Microsoft token-request fejlede: ${response.status} ${JSON.stringify(data)}`);
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
}

/** Henter en gyldig access token; forny den automatisk hvis den er udløbet. */
async function ensureFreshToken(stored, opts) {
  if (stored.accessToken && stored.expiresAt && stored.expiresAt > Date.now()) {
    return stored;
  }
  const refreshed = await refreshAccessToken({
    tenant: opts.tenant,
    clientId: opts.clientId,
    clientSecret: opts.clientSecret,
    refreshToken: stored.refreshToken,
  });
  // Microsoft udsteder normalt en ny refresh token ved hver fornyelse.
  return {
    ...stored,
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken || stored.refreshToken,
    expiresAt: refreshed.expiresAt,
  };
}

async function graphRequest(accessToken, path, options = {}) {
  const response = await fetch(`${GRAPH_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Graph-kald fejlede (${path}): ${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}

/** Finder (eller opretter) den dedikerede liste til hjemmesidens opgaver. */
async function ensureList(accessToken, listName) {
  const existing = await graphRequest(accessToken, "/me/todo/lists");
  const found = (existing.value || []).find((l) => l.displayName === listName);
  if (found) return found.id;
  const created = await graphRequest(accessToken, "/me/todo/lists", {
    method: "POST",
    body: JSON.stringify({ displayName: listName }),
  });
  return created.id;
}

async function createTask(accessToken, listId, { title, description }) {
  const task = await graphRequest(accessToken, `/me/todo/lists/${listId}/tasks`, {
    method: "POST",
    body: JSON.stringify({
      title,
      body: description ? { content: description, contentType: "text" } : undefined,
    }),
  });
  return task.id;
}

async function updateTaskBody(accessToken, listId, taskId, description) {
  await graphRequest(accessToken, `/me/todo/lists/${listId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ body: { content: description, contentType: "text" } }),
  });
}

async function deleteTask(accessToken, listId, taskId) {
  await graphRequest(accessToken, `/me/todo/lists/${listId}/tasks/${taskId}`, { method: "DELETE" });
}

/**
 * Henter ændringer siden sidste kald via delta-query. Første kald (uden
 * deltaLink) henter alle opgaver; efterfølgende kald returnerer kun det, der
 * er ændret siden sidst (fuldført, omdøbt, slettet m.m.).
 */
async function fetchDelta(accessToken, listId, deltaLink) {
  let url = deltaLink ? deltaLink.replace(GRAPH_BASE, "") : `/me/todo/lists/${listId}/tasks/delta`;
  const items = [];
  let nextDeltaLink = null;
  while (url) {
    const page = await graphRequest(accessToken, url);
    items.push(...(page.value || []));
    if (page["@odata.nextLink"]) {
      url = page["@odata.nextLink"].replace(GRAPH_BASE, "");
    } else {
      nextDeltaLink = page["@odata.deltaLink"] || null;
      url = null;
    }
  }
  return { items, deltaLink: nextDeltaLink };
}

module.exports = {
  authorizeUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  ensureFreshToken,
  ensureList,
  createTask,
  updateTaskBody,
  deleteTask,
  fetchDelta,
};
