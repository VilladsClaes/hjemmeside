// Admin-side til at godkende/afvise forslag fra den offentlige opgaveliste,
// og til at forbinde Microsoft To Do / Google Tasks. Kun tilgængelig for den
// konto, der er godkendt som ejer (håndhævet af Firestore-regler og Cloud
// Functions — denne fil gatekeeper kun UI'et, ikke selve adgangen).

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-functions.js";

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const region = window.FIREBASE_FUNCTIONS_REGION || "us-central1";
const functions = getFunctions(app, region);

const signedOutView = document.getElementById("signed-out-view");
const signedInView = document.getElementById("signed-in-view");
const signInBtn = document.getElementById("sign-in-btn");
const signOutBtn = document.getElementById("sign-out-btn");
const authStatus = document.querySelector("[data-auth-status]");
const userEmailEl = document.querySelector("[data-user-email]");
const connectMicrosoftBtn = document.getElementById("connect-microsoft-btn");
const connectGoogleBtn = document.getElementById("connect-google-btn");

signInBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (err) {
    authStatus.textContent = "Kunne ikke logge ind: " + err.message;
  }
});

signOutBtn.addEventListener("click", () => signOut(auth));

function functionsBaseUrl() {
  const projectId = window.FIREBASE_CONFIG.projectId;
  return `https://${region}-${projectId}.cloudfunctions.net`;
}

async function startOauth(functionName) {
  const user = auth.currentUser;
  if (!user) return;
  const idToken = await user.getIdToken();
  window.open(`${functionsBaseUrl()}/${functionName}?idToken=${encodeURIComponent(idToken)}`, "_blank", "noopener");
}

connectMicrosoftBtn.addEventListener("click", () => startOauth("msOauthStart"));
connectGoogleBtn.addEventListener("click", () => startOauth("googleOauthStart"));

let unsubscribeSubmissions = null;
let unsubscribeClaims = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    signedOutView.hidden = true;
    signedInView.hidden = false;
    userEmailEl.textContent = user.email || "(ukendt e-mail)";
    subscribeQueues();
  } else {
    signedOutView.hidden = false;
    signedInView.hidden = true;
    if (unsubscribeSubmissions) unsubscribeSubmissions();
    if (unsubscribeClaims) unsubscribeClaims();
  }
});

function renderEmpty(listEl, message) {
  listEl.replaceChildren();
  const li = document.createElement("li");
  li.className = "task-list-empty";
  li.textContent = message;
  listEl.appendChild(li);
}

function approvalRow(id, titleText, detailText, onApprove, onReject) {
  const li = document.createElement("li");
  li.className = "task-item";

  const title = document.createElement("h3");
  title.textContent = titleText;
  li.appendChild(title);

  if (detailText) {
    const p = document.createElement("p");
    p.className = "task-description";
    p.textContent = detailText;
    li.appendChild(p);
  }

  const actions = document.createElement("div");
  actions.className = "admin-row-actions";

  const approveBtn = document.createElement("button");
  approveBtn.className = "btn btn-primary btn-small";
  approveBtn.type = "button";
  approveBtn.textContent = "Godkend";

  const rejectBtn = document.createElement("button");
  rejectBtn.className = "btn btn-ghost btn-small";
  rejectBtn.type = "button";
  rejectBtn.textContent = "Afvis";

  const status = document.createElement("span");
  status.className = "form-status";

  async function run(button, fn) {
    approveBtn.disabled = true;
    rejectBtn.disabled = true;
    try {
      await fn(id);
    } catch (err) {
      status.textContent = "Fejl: " + err.message;
      approveBtn.disabled = false;
      rejectBtn.disabled = false;
    }
  }

  approveBtn.addEventListener("click", () => run(approveBtn, onApprove));
  rejectBtn.addEventListener("click", () => run(rejectBtn, onReject));

  actions.append(approveBtn, rejectBtn, status);
  li.appendChild(actions);
  return li;
}

function subscribeQueues() {
  const approveSubmission = httpsCallable(functions, "approveSubmission");
  const rejectSubmission = httpsCallable(functions, "rejectSubmission");
  const approveClaim = httpsCallable(functions, "approveClaim");
  const rejectClaim = httpsCallable(functions, "rejectClaim");

  const submissionsList = document.querySelector('[data-queue="submissions"]');
  const claimsList = document.querySelector('[data-queue="claims"]');

  if (unsubscribeSubmissions) unsubscribeSubmissions();
  unsubscribeSubmissions = onSnapshot(
    query(collection(db, "pendingSubmissions"), orderBy("createdAt", "desc")),
    (snapshot) => {
      if (snapshot.empty) {
        renderEmpty(submissionsList, "Ingen ventende forslag.");
        return;
      }
      submissionsList.replaceChildren();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const detail = [data.description, data.contactName ? `Fra: ${data.contactName}` : null]
          .filter(Boolean)
          .join(" — ");
        submissionsList.appendChild(
          approvalRow(
            docSnap.id,
            data.title,
            detail,
            (id) => approveSubmission({ id }),
            (id) => rejectSubmission({ id })
          )
        );
      });
    }
  );

  if (unsubscribeClaims) unsubscribeClaims();
  unsubscribeClaims = onSnapshot(
    query(collection(db, "pendingClaims"), orderBy("createdAt", "desc")),
    (snapshot) => {
      if (snapshot.empty) {
        renderEmpty(claimsList, "Ingen ventende forslag.");
        return;
      }
      claimsList.replaceChildren();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        claimsList.appendChild(
          approvalRow(
            docSnap.id,
            `${data.claimantName} vil tage opgaven`,
            data.claimantContact || "",
            (id) => approveClaim({ id }),
            (id) => rejectClaim({ id })
          )
        );
      });
    }
  );
}
