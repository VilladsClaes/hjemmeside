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
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const app = initializeApp(window.FIREBASE_CONFIG);
const db = getFirestore(app);

const openList = document.querySelector('[data-task-list="open"]');
const doneList = document.querySelector('[data-task-list="done"]');
const form = document.getElementById("task-form");
const formStatus = document.querySelector("[data-form-status]");

// Enkel klient-side spam-bremse: lad ikke samme browser sende mere end ét
// forslag hvert 30. sekund. Suppleres af Firestore-reglerne på serversiden.
let lastSubmitAt = 0;
const SUBMIT_COOLDOWN_MS = 30 * 1000;

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
      snapshot.forEach((docSnap) => {
        const task = docSnap.data();
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

subscribeToTasks();
initSubmissionForm();
