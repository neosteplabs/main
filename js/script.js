import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   Elements
========================= */

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("auth-message");

/* =========================
   Generate Unique Referral Code (NSXXXX)
========================= */

async function generateReferralCode() {
  let code;
  let exists = true;

  while (exists) {
    const random = Math.floor(1000 + Math.random() * 9000);
    code = `NS${random}`;

    const q = query(
      collection(db, "users"),
      where("referralCode", "==", code)
    );

    const snapshot = await getDocs(q);
    exists = !snapshot.empty;
  }

  return code;
}

/* =========================
   Register
========================= */

registerBtn?.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    message.textContent = "Please enter email and password.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    const referralCode = await generateReferralCode();

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      referralCode,
      profileComplete: false,
      createdAt: serverTimestamp()
    });

    window.location.href = "complete-profile.html";

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      message.textContent = "That email is already registered. Please login.";
    } else {
      message.textContent = error.message;
    }
  }
});

/* =========================
   Login
========================= */

loginBtn?.addEventListener("click", async () => {

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    if (message) message.textContent = "Please enter email and password.";
    return;
  }

  try {

    await signInWithEmailAndPassword(auth, email, password);

    window.location.replace("catalog.html");

  } catch (error) {
    if (message) message.textContent = error.message;
  }
});

/* =========================
   Auth State Listener (SAFE)
========================= */

onAuthStateChanged(auth, (user) => {

  // Only redirect IF we are on index.html
  const path = window.location.pathname;

  const isIndex =
    path.endsWith("index.html") ||
    path === "/" ||
    path.endsWith("/docs/");

  if (isIndex && user && user.emailVerified) {
    window.location.replace("catalog.html");
  }

});
