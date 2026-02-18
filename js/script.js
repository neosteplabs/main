import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

setPersistence(auth, browserLocalPersistence);

/* ===============================
   DOM
================================= */
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authSection = document.getElementById("authSection");
const modal = document.getElementById("verificationModal");
const resendBtn = document.getElementById("resendVerification");

/* ===============================
   REGISTER
================================= */
registerBtn?.addEventListener("click", async () => {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {

    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await sendEmailVerification(userCred.user);

    await signOut(auth);

    showVerificationModal(email);

  } catch (error) {
    alert(error.message);
  }

});

/* ===============================
   LOGIN
================================= */
loginBtn?.addEventListener("click", async () => {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }

});

/* ===============================
   LOGOUT
================================= */
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

/* ===============================
   Verification Modal Logic
================================= */
function showVerificationModal(email) {

  modal.style.display = "flex";
  modal.querySelector(".modal-email").textContent = email;

}

resendBtn?.addEventListener("click", async () => {

  const user = auth.currentUser;
  if (!user) return;

  await sendEmailVerification(user);
  alert("Verification email resent.");

});

/* ===============================
   Auth State Watcher
================================= */
onAuthStateChanged(auth, async (user) => {

  const path = window.location.pathname;

  if (!user) {
    if (!path.includes("index")) {
      window.location.href = "index.html";
    }
    return;
  }

  // EMAIL NOT VERIFIED
  if (!user.emailVerified) {

    showVerificationModal(user.email);

    const interval = setInterval(async () => {

      await user.reload();

      if (user.emailVerified) {
        clearInterval(interval);
        modal.style.display = "none";
        window.location.href = "complete-profile.html";
      }

    }, 5000);

    return;
  }

  // VERIFIED USER
  if (path.includes("index")) {
    window.location.href = "catalog.html";
  }

});