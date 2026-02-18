import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
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
   Generate Unique Referral Code
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

    // Generate referral code
    const referralCode = await generateReferralCode();

    // Create Firestore user document
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      referralCode,
      profileComplete: false,
      createdAt: serverTimestamp()
    });

    // Send email verification
    await sendEmailVerification(user);

    alert("Verification email sent. Please verify before logging in.");

    await auth.signOut();

  } catch (error) {
    message.textContent = error.message;
  }
});

/* =========================
   Login
========================= */

loginBtn?.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    if (!user.emailVerified) {
      alert("Please verify your email before accessing the portal.");
      await auth.signOut();
      return;
    }

    window.location.href = "catalog.html";

  } catch (error) {
    message.textContent = error.message;
  }
});

/* =========================
   Auto Redirect if Logged In
========================= */

onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    window.location.href = "catalog.html";
  }
});