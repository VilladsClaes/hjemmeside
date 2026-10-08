"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const crypto = require("crypto");
const googleTasks = require("./lib/googleTasks");
const params = require("./lib/params");
const { saveTokens } = require("./lib/tokenStore");

const STATE_TTL_MS = 10 * 60 * 1000;

async function assertOwnerFromIdToken(idToken) {
  if (!idToken) throw new Error("Mangler idToken.");
  const decoded = await getAuth().verifyIdToken(idToken);
  const ownerEmail = params.OWNER_EMAIL.value();
  if (!decoded.email || decoded.email.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new Error("Kun ejeren kan forbinde Google Tasks.");
  }
}

// Samme to-trins mønster som oauthMicrosoft.js — se kommentarer der.
const googleOauthStart = onRequest({ secrets: [params.GOOGLE_CLIENT_SECRET] }, async (req, res) => {
  try {
    await assertOwnerFromIdToken(req.query.idToken);
    const state = crypto.randomBytes(16).toString("hex");
    await getFirestore()
      .collection("config")
      .doc("oauthState")
      .set({ google: { state, expiresAt: Date.now() + STATE_TTL_MS } }, { merge: true });

    const url = googleTasks.authorizeUrl({
      clientId: params.GOOGLE_CLIENT_ID.value(),
      clientSecret: params.GOOGLE_CLIENT_SECRET.value(),
      redirectUri: params.GOOGLE_REDIRECT_URI.value(),
      state,
    });
    res.redirect(url);
  } catch (err) {
    res.status(403).send(`Kunne ikke starte Google-login: ${err.message}`);
  }
});

const googleOauthCallback = onRequest(
  { secrets: [params.GOOGLE_CLIENT_SECRET, params.TOKEN_ENCRYPTION_KEY] },
  async (req, res) => {
    try {
      const { code, state, error } = req.query;
      if (error) throw new Error(String(error));

      const stateDoc = await getFirestore().collection("config").doc("oauthState").get();
      const stored = stateDoc.exists ? stateDoc.data().google : null;
      if (!stored || stored.state !== state || stored.expiresAt < Date.now()) {
        throw new Error("Login-forsøget er udløbet eller ugyldigt. Prøv igen fra admin-siden.");
      }

      const opts = {
        clientId: params.GOOGLE_CLIENT_ID.value(),
        clientSecret: params.GOOGLE_CLIENT_SECRET.value(),
        redirectUri: params.GOOGLE_REDIRECT_URI.value(),
      };
      const tokens = await googleTasks.exchangeCodeForTokens({ ...opts, code });
      const listId = await googleTasks.ensureList(tokens, opts, params.GOOGLE_LIST_TITLE.value());
      await saveTokens("google", { ...tokens, listId }, params.TOKEN_ENCRYPTION_KEY.value());

      res.status(200).send(
        `<!doctype html><html lang="da"><meta charset="utf-8"><title>Forbundet</title>
        <body style="font-family:system-ui;max-width:32rem;margin:4rem auto;text-align:center">
          <h1>✅ Forbundet til Google Tasks</h1>
          <p>Du kan lukke denne fane og gå tilbage til admin-siden.</p>
        </body></html>`
      );
    } catch (err) {
      res.status(400).send(
        `<!doctype html><html lang="da"><meta charset="utf-8"><title>Noget gik galt</title>
        <body style="font-family:system-ui;max-width:32rem;margin:4rem auto;text-align:center">
          <h1>⚠️ Kunne ikke forbinde</h1><p>${String(err.message).replace(/</g, "&lt;")}</p>
        </body></html>`
      );
    }
  }
);

module.exports = { googleOauthStart, googleOauthCallback };
