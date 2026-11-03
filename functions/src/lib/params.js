"use strict";

// Centrale konfigurationsparametre (Cloud Functions 2nd gen "params"-API).
// Ikke-hemmelige værdier læses fra functions/.env, hemmeligheder fra Firebase
// Secret Manager (sat via `firebase functions:secrets:set NAVN`).
// Se functions/.env.example for en beskrivelse af hver værdi.

const { defineString, defineSecret } = require("firebase-functions/params");

const OWNER_EMAIL = defineString("OWNER_EMAIL");
const ACTIVE_PROVIDER = defineString("ACTIVE_PROVIDER", { default: "microsoft" });

const MS_CLIENT_ID = defineString("MS_CLIENT_ID");
const MS_CLIENT_SECRET = defineSecret("MS_CLIENT_SECRET");
const MS_TENANT = defineString("MS_TENANT", { default: "consumers" });
const MS_REDIRECT_URI = defineString("MS_REDIRECT_URI");
const MS_LIST_NAME = defineString("MS_LIST_NAME", { default: "Fra hjemmesiden" });

const GOOGLE_CLIENT_ID = defineString("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = defineSecret("GOOGLE_CLIENT_SECRET");
const GOOGLE_REDIRECT_URI = defineString("GOOGLE_REDIRECT_URI");
const GOOGLE_LIST_TITLE = defineString("GOOGLE_LIST_TITLE", { default: "Fra hjemmesiden" });

const TOKEN_ENCRYPTION_KEY = defineSecret("TOKEN_ENCRYPTION_KEY");

module.exports = {
  OWNER_EMAIL,
  ACTIVE_PROVIDER,
  MS_CLIENT_ID,
  MS_CLIENT_SECRET,
  MS_TENANT,
  MS_REDIRECT_URI,
  MS_LIST_NAME,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_LIST_TITLE,
  TOKEN_ENCRYPTION_KEY,
};
