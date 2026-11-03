"use strict";

const crypto = require("crypto");

/**
 * Simpel AES-256-GCM kryptering/dekryptering, brugt til at gemme refresh
 * tokens i Firestore. Firestore-reglerne blokerer allerede al klientadgang
 * til "config"-collectionen, men vi krypterer alligevel tokens "i hvile" som
 * ekstra beskyttelseslag (forsvar i dybden).
 *
 * key skal være en 32-byte buffer (64 hex-tegn), fx fra
 * TOKEN_ENCRYPTION_KEY-secret'en.
 */
function encrypt(plainText, hexKey) {
  const key = Buffer.from(hexKey, "hex");
  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY skal være 32 byte (64 hex-tegn).");
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

function decrypt(payload, hexKey) {
  const key = Buffer.from(hexKey, "hex");
  const [ivHex, authTagHex, dataHex] = String(payload).split(":");
  if (!ivHex || !authTagHex || !dataHex) {
    throw new Error("Ugyldigt krypteret payload-format.");
  }
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = { encrypt, decrypt };
