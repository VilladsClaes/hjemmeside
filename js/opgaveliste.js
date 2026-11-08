// Offentlig opgaveliste: viser godkendte opgaver og lader besøgende foreslå
// nye opgaver eller tage en ubemandet opgave. Bruger Firebase direkte fra
// browseren (ingen build-trin) — konfigurationen kommer fra js/firebase-config.js.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const app = initializeApp(window.FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);

const openList = document.querySelector('[data-task-list="open"]');
const doneList = document.querySelector('[data-task-list="done"]');
const form = document.getElementById("task-form");
const formStatus = document.querySelector("[data-form-status]");
const contactNameInput = document.getElementById("task-contact-name");
const contactEmailInput = document.getElementById("task-contact-email");

// Enkel klient-side spam-bremse: lad ikke samme browser sende mere end ét
// forslag hvert 30. sekund. Suppleres af Firestore-reglerne på serversiden.
let lastSubmitAt = 0;
const SUBMIT_COOLDOWN_MS = 30 * 1000;

// Den aktuelt loggede ind bruger (eller null), sat af onAuthStateChanged
// nedenfor. Bruges til at knytte "uid" på forslag/claims, og til at vise
// "Mine forslag og opgaver".
let currentUser = null;

// Opgavernes titler slås op her, så "Mine ... anmodninger" kan vise en
// opgavetitel for en claim (som selv kun gemmer taskId).
const tasksById = new Map();

// Sat af initAccount() nedenfor, så subscribeToTasks() kan genopfriske
// "Mine opgaver"-visningen, når opgavetitler ændrer sig.
let refreshMyClaims = () => {};

function renderEmptyState(listEl, message) {
  listEl.replaceChildren();
  const li = document.createElement("li");
  li.className = "task-list-empty";
  li.textContent = message;
  listEl.appendChild(li);
}

function createTaskItem(id, task) {
  const li = document.createElement("li");
  li.className = "task-item";

  const title = document.createElement("h3");
  title.textContent = task.title || "(uden titel)";
  li.appendChild(title);

  if (task.description) {
    const desc = document.createElement("p");
    desc.className = "task-description";
    desc.textContent = task.description;
    li.appendChild(desc);
  }

  const meta = document.createElement("div");
  meta.className = "task-meta";
  if (task.assignee) {
    const tag = document.createElement("span");
    tag.className = "tag tag-sage";
    tag.textContent = `Ansvarlig: ${task.assignee}`;
    meta.appendChild(tag);
  } else if (task.status !== "done") {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = "Ingen ansvarlig endnu";
    meta.appendChild(tag);

    const claimBtn = document.createElement("button");
    claimBtn.type = "button";
    claimBtn.className = "btn btn-ghost btn-small";
    claimBtn.textContent = "Tag denne opgave";
    claimBtn.addEventListener("click", () => openClaimForm(li, id));
    meta.appendChild(claimBtn);
  }
  li.appendChild(meta);

  return li;
}

function openClaimForm(taskEl, taskId) {
  if (taskEl.querySelector(".claim-form")) return; // allerede åben

  const claimForm = document.createElement("form");
  claimForm.className = "claim-form";
  claimForm.innerHTML = `
    <div class="field">
      <label>Dit navn <span aria-hidden="true">*</span></label>
      <input type="text" name="claimantName" maxlength="120" required>
    </div>
    <div class="field">
      <label>Din kontakt (valgfrit)</label>
      <input type="text" name="claimantContact" maxlength="200" placeholder="e-mail eller andet">
    </div>
    <div class="claim-form-actions">
      <button class="btn btn-primary btn-small" type="submit">Meld mig</button>
      <button class="btn btn-ghost btn-small" type="button" data-cancel>Fortryd</button>
    </div>
    <p class="form-status" role="status" aria-live="polite"></p>
  `;
  if (currentUser) {
    const nameInput = claimForm.querySelector('[name="claimantName"]');
    const contactInput = claimForm.querySelector('[name="claimantContact"]');
    if (nameInput && currentUser.displayName) nameInput.value = currentUser.displayName;
    if (contactInput && currentUser.email) contactInput.value = currentUser.email;
  }
  claimForm.querySelector("[data-cancel]").addEventListener("click", () => claimForm.remove());
  claimForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const statusEl = claimForm.querySelector(".form-status");
    const data = new FormData(claimForm);
    const claimantName = String(data.get("claimantName") || "").trim();
    if (!claimantName) return;
    try {
      await addDoc(collection(db, "pendingClaims"), {
        taskId,
        claimantName,
        claimantContact: String(data.get("claimantContact") || "").trim() || null,
        status: "pending",
        createdAt: serverTimestamp(),
        uid: currentUser ? currentUser.uid : null,
      });
      statusEl.textContent = "Tak! Du er foreslået som ansvarlig og afventer godkendelse.";
      claimForm.querySelector("button[type=submit]").disabled = true;
    } catch (err) {
      statusEl.textContent = "Hov, noget gik galt. Prøv igen om lidt.";
      console.error(err);
    }
  });
  taskEl.appendChild(claimForm);
}

function subscribeToTasks() {
  const tasksQuery = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
  onSnapshot(
    tasksQuery,
    (snapshot) => {
      const open = [];
      const done = [];
      tasksById.clear();
      snapshot.forEach((docSnap) => {
        const task = docSnap.data();
        tasksById.set(docSnap.id, task);
        (task.status === "done" ? done : open).push([docSnap.id, task]);
      });

      if (open.length === 0) {
        renderEmptyState(openList, "Ingen åbne opgaver lige nu — foreslå gerne en!");
      } else {
        openList.replaceChildren();
        open.forEach(([id, task]) => openList.appendChild(createTaskItem(id, task)));
      }

      if (done.length === 0) {
        renderEmptyState(doneList, "Ingen afsluttede opgaver endnu.");
      } else {
        doneList.replaceChildren();
        done.forEach(([id, task]) => doneList.appendChild(createTaskItem(id, task)));
      }

      // Opgavetitler kan være brugt af "Mine opgaver"-listen (claims), så
      // genopfrisk den visning, hvis brugeren er logget ind.
      if (currentUser) refreshMyClaims();
    },
    (err) => {
      renderEmptyState(openList, "Kunne ikke hente opgaver lige nu. Prøv at opdatere siden.");
      console.error(err);
    }
  );
}

function initSubmissionForm() {
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);

    // Honeypot: hvis dette skjulte felt er udfyldt, er det højst sandsynligt en bot.
    if (String(data.get("website") || "").trim()) {
      formStatus.textContent = "Tak!";
      form.reset();
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAt < SUBMIT_COOLDOWN_MS) {
      formStatus.textContent = "Vent lidt før du sender endnu et forslag.";
      return;
    }

    const title = String(data.get("title") || "").trim();
    if (!title) {
      formStatus.textContent = "Skriv venligst en titel.";
      return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    try {
      await addDoc(collection(db, "pendingSubmissions"), {
        title,
        description: String(data.get("description") || "").trim() || null,
        contactName: String(data.get("contactName") || "").trim() || null,
        contactEmail: String(data.get("contactEmail") || "").trim() || null,
        status: "pending",
        createdAt: serverTimestamp(),
        uid: currentUser ? currentUser.uid : null,
      });
      lastSubmitAt = now;
      formStatus.textContent = "Tak! Dit forslag venter på godkendelse.";
      form.reset();
    } catch (err) {
      formStatus.textContent = "Hov, noget gik galt. Prøv igen om lidt.";
      console.error(err);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// ---------------------------------------------------------------------
// Konto: opret/log ind/log ud, kodeordsstyrke, og "Mine forslag og opgaver"
// ---------------------------------------------------------------------
//
// Formålet med kontoen er reelt: en besøgende, der opretter sig, kan følge
// status på sine egne indsendte forslag og "tag denne opgave"-anmodninger,
// i stedet for at skulle holde styr på det selv. Anonym indsendelse uden
// konto virker stadig som før (uid sættes blot til null ovenfor).

const FIREBASE_ERROR_MESSAGES = {
  "auth/email-already-in-use": "Der findes allerede en konto med denne e-mail.",
  "auth/invalid-email": "E-mailadressen ser ikke gyldig ud.",
  "auth/weak-password": "Kodeordet er for kort (Firebase kræver mindst 6 tegn).",
  "auth/wrong-password": "Forkert e-mail eller kodeord.",
  "auth/invalid-credential": "Forkert e-mail eller kodeord.",
  "auth/user-not-found": "Vi kan ikke finde en konto med den e-mail.",
  "auth/too-many-requests": "For mange forsøg. Vent lidt, og prøv igen.",
};

function translateAuthError(err) {
  return (err && FIREBASE_ERROR_MESSAGES[err.code]) || "Hov, noget gik galt. Prøv igen om lidt.";
}

// Samme pointberegning (0-4) som kodeordsdemoen i legeplads.html, men som en
// selvstændig implementering her — her bruges den til en rigtig konto, og
// håndhæves (se MIN_SCORE_TO_SUBMIT), i stedet for blot at være vejledende.
const STRENGTH_TEXT = [
  "Skriv et kodeord på mindst 8 tegn.",
  "Meget svagt — gør det gerne længere eller mere varieret.",
  "Svagt — tilføj gerne tal eller specialtegn.",
  "Rimeligt — klar til at oprette kontoen.",
  "Stærkt kodeord.",
];
const STRENGTH_COLOR = ["#bd7162", "#bd7162", "#ca9851", "#789b76", "#438278"];
const MIN_SCORE_TO_SUBMIT = 2; // "Rimeligt" — håndhævet minimum for kontooprettelse

function passwordScore(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (!value) score = 0;
  return score;
}

function renderMyList(listEl, items, emptyMessage) {
  if (!listEl) return;
  if (items.length === 0) {
    renderEmptyState(listEl, emptyMessage);
    return;
  }
  listEl.replaceChildren();
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "task-item";
    const title = document.createElement("h3");
    title.textContent = item.title || "(uden titel)";
    li.appendChild(title);
    const meta = document.createElement("div");
    meta.className = "task-meta";
    const tag = document.createElement("span");
    tag.className = `tag ${item.tagClass}`;
    tag.textContent = item.tagText;
    meta.appendChild(tag);
    li.appendChild(meta);
    listEl.appendChild(li);
  });
}

function initAccount() {
  const signedOutView = document.querySelector("[data-account-signed-out]");
  const signedInView = document.querySelector("[data-account-signed-in]");
  const accountNameEl = document.querySelector("[data-account-name]");
  const signoutBtn = document.querySelector("[data-account-signout]");
  const tabs = document.querySelectorAll("[data-account-tab]");
  const signupForm = document.getElementById("signup-form");
  const signinForm = document.getElementById("signin-form");
  const signupStatus = document.querySelector("[data-signup-status]");
  const signinStatus = document.querySelector("[data-signin-status]");
  const signupPassword = document.getElementById("signup-password");
  const passwordMeterEl = signupForm ? signupForm.querySelector(".password-meter") : null;
  const passwordMeterFill = signupForm ? signupForm.querySelector(".password-meter-fill") : null;
  const strengthTextEl = document.querySelector("[data-signup-strength]");
  const signupSubmitBtn = document.querySelector("[data-signup-submit]");
  const passwordVisibilityBtn = signupForm ? signupForm.querySelector(".password-visibility") : null;
  const myListSubmissions = document.querySelector('[data-my-list="submissions"]');
  const myListClaims = document.querySelector('[data-my-list="claims"]');

  if (!signupForm || !signinForm) return; // markup mangler (bør ikke ske)

  let myPendingSubmissions = [];
  let myApprovedSubmissions = [];
  let myPendingClaims = [];
  let myApprovedClaims = [];
  let unsubMine = [];

  function switchTab(which) {
    const isSignup = which === "signup";
    tabs.forEach((tab) => {
      const active = tab.dataset.accountTab === which;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    signupForm.hidden = !isSignup;
    signinForm.hidden = isSignup;
  }
  tabs.forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.accountTab)));

  function updateSignupMeter() {
    const score = passwordScore(signupPassword.value);
    if (passwordMeterFill) {
      passwordMeterFill.style.width = score * 25 + "%";
      passwordMeterFill.style.backgroundColor = STRENGTH_COLOR[score];
    }
    if (passwordMeterEl) passwordMeterEl.setAttribute("aria-valuenow", String(score));
    if (strengthTextEl) {
      strengthTextEl.textContent = STRENGTH_TEXT[score];
      strengthTextEl.classList.toggle("is-ok", score >= MIN_SCORE_TO_SUBMIT);
    }
    if (signupSubmitBtn) signupSubmitBtn.disabled = score < MIN_SCORE_TO_SUBMIT;
    return score;
  }
  if (signupPassword) {
    signupPassword.addEventListener("input", updateSignupMeter);
    updateSignupMeter();
  }
  if (passwordVisibilityBtn && signupPassword) {
    passwordVisibilityBtn.addEventListener("click", () => {
      const visible = signupPassword.type === "password";
      signupPassword.type = visible ? "text" : "password";
      passwordVisibilityBtn.setAttribute("aria-pressed", String(visible));
      passwordVisibilityBtn.setAttribute("aria-label", visible ? "Skjul kodeord" : "Vis kodeord");
      passwordVisibilityBtn.textContent = visible ? "Skjul" : "Vis";
      signupPassword.focus();
    });
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(signupForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const passwordConfirm = String(data.get("passwordConfirm") || "");

    if (!name) {
      signupStatus.textContent = "Skriv venligst dit navn.";
      return;
    }
    if (password !== passwordConfirm) {
      signupStatus.textContent = "Kodeordene er ikke ens.";
      return;
    }
    if (passwordScore(password) < MIN_SCORE_TO_SUBMIT) {
      signupStatus.textContent = "Vælg et stærkere kodeord, før du opretter kontoen.";
      return;
    }

    const submitBtn = signupForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    signupStatus.textContent = "";
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      signupForm.reset();
    } catch (err) {
      signupStatus.textContent = translateAuthError(err);
      console.error(err);
    } finally {
      updateSignupMeter();
    }
  });

  signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(signinForm);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    if (!email || !password) {
      signinStatus.textContent = "Udfyld venligst e-mail og kodeord.";
      return;
    }
    const submitBtn = signinForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    signinStatus.textContent = "";
    try {
      await signInWithEmailAndPassword(auth, email, password);
      signinForm.reset();
    } catch (err) {
      signinStatus.textContent = translateAuthError(err);
      console.error(err);
    } finally {
      submitBtn.disabled = false;
    }
  });

  if (signoutBtn) signoutBtn.addEventListener("click", () => signOut(auth));

  function renderMySubmissions() {
    const items = [
      ...myPendingSubmissions.map((s) => ({
        title: s.title,
        tagText: "Afventer godkendelse",
        tagClass: "tag-sun",
      })),
      ...myApprovedSubmissions.map((t) => ({
        title: t.title,
        tagText: t.status === "done" ? "Godkendt og afsluttet" : "Godkendt — åben opgave",
        tagClass: "tag-sage",
      })),
    ];
    renderMyList(myListSubmissions, items, "Du har ikke indsendt nogen forslag endnu.");
  }

  function renderMyClaims() {
    const items = [
      ...myPendingClaims.map((c) => ({
        title: (tasksById.get(c.taskId) || {}).title || "En opgave",
        tagText: "Afventer godkendelse",
        tagClass: "tag-sun",
      })),
      ...myApprovedClaims.map((t) => ({
        title: t.title,
        tagText: t.status === "done" ? "Godkendt og afsluttet" : "Godkendt som ansvarlig",
        tagClass: "tag-sage",
      })),
    ];
    renderMyList(myListClaims, items, 'Du har ikke bedt om at tage nogen opgaver endnu.');
  }
  refreshMyClaims = renderMyClaims;

  function unsubscribeMine() {
    unsubMine.forEach((fn) => fn());
    unsubMine = [];
    myPendingSubmissions = [];
    myApprovedSubmissions = [];
    myPendingClaims = [];
    myApprovedClaims = [];
  }

  function subscribeMine() {
    unsubscribeMine();
    if (!currentUser) return;
    const uid = currentUser.uid;

    unsubMine.push(
      onSnapshot(
        query(collection(db, "pendingSubmissions"), where("uid", "==", uid)),
        (snap) => {
          myPendingSubmissions = snap.docs.map((d) => d.data());
          renderMySubmissions();
        },
        (err) => console.error(err)
      )
    );
    unsubMine.push(
      onSnapshot(
        query(collection(db, "tasks"), where("submitterUid", "==", uid)),
        (snap) => {
          myApprovedSubmissions = snap.docs.map((d) => d.data());
          renderMySubmissions();
        },
        (err) => console.error(err)
      )
    );
    unsubMine.push(
      onSnapshot(
        query(collection(db, "pendingClaims"), where("uid", "==", uid)),
        (snap) => {
          myPendingClaims = snap.docs.map((d) => d.data());
          renderMyClaims();
        },
        (err) => console.error(err)
      )
    );
    unsubMine.push(
      onSnapshot(
        query(collection(db, "tasks"), where("claimantUid", "==", uid)),
        (snap) => {
          myApprovedClaims = snap.docs.map((d) => d.data());
          renderMyClaims();
        },
        (err) => console.error(err)
      )
    );
  }

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      if (signedOutView) signedOutView.hidden = true;
      if (signedInView) signedInView.hidden = false;
      if (accountNameEl) accountNameEl.textContent = user.displayName || user.email || "din konto";
      if (contactNameInput && !contactNameInput.value) contactNameInput.value = user.displayName || "";
      if (contactEmailInput && !contactEmailInput.value) contactEmailInput.value = user.email || "";
      subscribeMine();
    } else {
      if (signedOutView) signedOutView.hidden = false;
      if (signedInView) signedInView.hidden = true;
      unsubscribeMine();
    }
  });
}

initAccount();
subscribeToTasks();
initSubmissionForm();
