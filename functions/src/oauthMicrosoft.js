"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const crypto = require("crypto");
const msGraph = require("./lib/msGraph");
const params = require("./lib/params");
const { saveTokens } = require("./lib/tokenStore");

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutter til at gennemføre login

async function assertOwnerFromIdToken(idToken) {
  if (!idToken) throw new Error("Mangler idToken.");
  const decoded = await getAuth().verifyIdToken(idToken);
  const ownerEmail = params.OWNER_EMAIL.value();
  if (!decoded.email || decoded.email.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new Error("Kun ejeren kan forbinde Microsoft To Do.");
  }
}

/**
 * Trin 1: Ejeren klikker "Forbind Microsoft To Do" på opgaveliste-admin.html,
 * som sender sit Firebase idToken hertil. Vi verificerer at det er ejeren,
 * gemmer en kortvarig "state"-nonce, og sender videre til Microsofts login.
 */
const msOauthStart = onRequest({ secrets: [params.MS_CLIENT_SECRET] }, async (req, res) => {
  try {
    await assertOwnerFromIdToken(req.query.idToken);
    const state = crypto.randomBytes(16).toString("hex");
    await getFirestore()
      .collection("config")
      .doc("oauthState")
      .set({ microsoft: { state, expiresAt: Date.now() + STATE_TTL_MS } }, { merge: true });

    const url = msGraph.authorizeUrl({
      tenant: params.MS_TENANT.value(),
      clientId: params.MS_CLIENT_ID.value(),
      redirectUri: params.MS_REDIRECT_URI.value(),
      state,
    });
    res.redirect(url);
  } catch (err) {
    res.status(403).send(`Kunne ikke starte Microsoft-login: ${err.message}`);
  }
});

/**
 * Trin 2: Microsoft sender brugeren tilbage hertil med en "code". Vi
 * udveksler den til tokens, gemmer dem krypteret, og sikrer at den
 * dedikerede "Fra hjemmesiden"-liste findes.
 */
const msOauthCallback = onRequest(
  { secrets: [params.MS_CLIENT_SECRET, params.TOKEN_ENCRYPTION_KEY] },
  async (req, res) => {
    try {
      const { code, state, error, error_description: errorDescription } = req.query;
      if (error) throw new Error(errorDescription || error);

      const stateDoc = await getFirestore().collection("config").doc("oauthState").get();
      const stored = stateDoc.exists ? stateDoc.data().microsoft : null;
      if (!stored || stored.state !== state || stored.expiresAt < Date.now()) {
        throw new Error("Login-forsøget er udløbet eller ugyldigt. Prøv igen fra admin-siden.");
      }

      const opts = {
        tenant: params.MS_TENANT.value(),
        clientId: params.MS_CLIENT_ID.value(),
        clientSecret: params.MS_CLIENT_SECRET.value(),
        redirectUri: params.MS_REDIRECT_URI.value(),
      };
      const tokens = await msGraph.exchangeCodeForTokens({ ...opts, code });
      const listId = await msGraph.ensureList(tokens.accessToken, params.MS_LIST_NAME.value());
      await saveTokens("microsoft", { ...tokens, listId }, params.TOKEN_ENCRYPTION_KEY.value());

      res.status(200).send(successPage("Microsoft To Do"));
    } catch (err) {
      res.status(400).send(failurePage(err.message));
    }
  }
);

function successPage(providerLabel) {
  return `<!doctype html><html lang="da"><meta charset="utf-8">
  <title>Forbundet</title>
  <body style="font-family:system-ui;max-width:32rem;margin:4rem auto;text-align:center">
    <h1>✅ Forbundet til ${providerLabel}</h1>
    <p>Du kan lukke denne fane og gå tilbage til admin-siden.</p>
  </body></html>`;
}

function failurePage(message) {
  return `<!doctype html><html lang="da"><meta charset="utf-8">
  <title>Noget gik galt</title>
  <body style="font-family:system-ui;max-width:32rem;margin:4rem auto;text-align:center">
    <h1>⚠️ Kunne ikke forbinde</h1>
    <p>${escapeHtml(message)}</p>
  </body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

module.exports = { msOauthStart, msOauthCallback };
