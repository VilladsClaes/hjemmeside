"use strict";

const { initializeApp } = require("firebase-admin/app");

initializeApp();

const { approveSubmission, rejectSubmission, approveClaim, rejectClaim } = require("./src/approvals");
const { msOauthStart, msOauthCallback } = require("./src/oauthMicrosoft");
const { googleOauthStart, googleOauthCallback } = require("./src/oauthGoogle");
const { pullTaskChanges } = require("./src/scheduled");

// Godkendelse/afvisning af besøgendes forslag (kaldes fra opgaveliste-admin.html)
exports.approveSubmission = approveSubmission;
exports.rejectSubmission = rejectSubmission;
exports.approveClaim = approveClaim;
exports.rejectClaim = rejectClaim;

// Étgangs OAuth-forbindelse til Microsoft To Do (primær udbyder)
exports.msOauthStart = msOauthStart;
exports.msOauthCallback = msOauthCallback;

// Étgangs OAuth-forbindelse til Google Tasks (fallback-udbyder)
exports.googleOauthStart = googleOauthStart;
exports.googleOauthCallback = googleOauthCallback;

// Planlagt synkronisering: henter ændringer (fuldført/omdøbt/slettet) fra
// den aktive udbyder tilbage til den offentlige side.
exports.pullTaskChanges = pullTaskChanges;
