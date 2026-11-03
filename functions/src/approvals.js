"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const params = require("./lib/params");
const providers = require("./lib/providers");

function assertOwner(request) {
  const email = request.auth && request.auth.token && request.auth.token.email;
  const ownerEmail = params.OWNER_EMAIL.value();
  if (!email || email.toLowerCase() !== ownerEmail.toLowerCase()) {
    throw new HttpsError("permission-denied", "Kun ejeren kan godkende eller afvise opgaver.");
  }
}

const sharedSecrets = [params.TOKEN_ENCRYPTION_KEY, params.MS_CLIENT_SECRET, params.GOOGLE_CLIENT_SECRET];

const approveSubmission = onCall({ secrets: sharedSecrets }, async (request) => {
  assertOwner(request);
  const { id } = request.data || {};
  if (!id) throw new HttpsError("invalid-argument", "Mangler id på forslaget.");

  const db = getFirestore();
  const ref = db.collection("pendingSubmissions").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Forslaget findes ikke (måske allerede behandlet).");
  const submission = snap.data();

  const description = buildDescription(submission.description, submission.contactName, submission.contactEmail);
  const { provider, listId, remoteId } = await providers.pushNewTask({
    title: submission.title,
    description,
  });

  const taskRef = await db.collection("tasks").add({
    title: submission.title,
    description: submission.description || "",
    status: "open",
    assignee: submission.contactName || null,
    assigneeContact: submission.contactEmail || null,
    provider,
    remoteListId: listId,
    remoteTaskId: remoteId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await ref.delete();
  return { taskId: taskRef.id };
});

const rejectSubmission = onCall(async (request) => {
  assertOwner(request);
  const { id } = request.data || {};
  if (!id) throw new HttpsError("invalid-argument", "Mangler id på forslaget.");
  await getFirestore().collection("pendingSubmissions").doc(id).delete();
  return { ok: true };
});

const approveClaim = onCall({ secrets: sharedSecrets }, async (request) => {
  assertOwner(request);
  const { id } = request.data || {};
  if (!id) throw new HttpsError("invalid-argument", "Mangler id på forslaget.");

  const db = getFirestore();
  const claimRef = db.collection("pendingClaims").doc(id);
  const claimSnap = await claimRef.get();
  if (!claimSnap.exists) throw new HttpsError("not-found", "Forslaget findes ikke (måske allerede behandlet).");
  const claim = claimSnap.data();

  const taskRef = db.collection("tasks").doc(claim.taskId);
  const taskSnap = await taskRef.get();
  if (!taskSnap.exists) throw new HttpsError("not-found", "Opgaven findes ikke længere.");
  const task = taskSnap.data();

  const description = buildDescription(task.description, claim.claimantName, claim.claimantContact);
  if (task.provider && task.remoteListId && task.remoteTaskId) {
    await providers.pushDescriptionUpdate({
      provider: task.provider,
      listId: task.remoteListId,
      remoteId: task.remoteTaskId,
      description,
    });
  }

  await taskRef.update({
    assignee: claim.claimantName,
    assigneeContact: claim.claimantContact || null,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await claimRef.delete();
  return { ok: true };
});

const rejectClaim = onCall(async (request) => {
  assertOwner(request);
  const { id } = request.data || {};
  if (!id) throw new HttpsError("invalid-argument", "Mangler id på forslaget.");
  await getFirestore().collection("pendingClaims").doc(id).delete();
  return { ok: true };
});

function buildDescription(description, contactName, contactEmail) {
  const lines = [description || ""];
  if (contactName) {
    lines.push("", `Ansvarlig/kontaktperson: ${contactName}${contactEmail ? ` (${contactEmail})` : ""}`);
  }
  return lines.join("\n").trim();
}

module.exports = { approveSubmission, rejectSubmission, approveClaim, rejectClaim };
