import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { auth, db } from "./firebase-config.js";

function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "NS";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Capture referral from URL
const params = new URLSearchParams(window.location.search);
if (params.get("ref")) {
  localStorage.setItem("referralCode", params.get("ref"));
}

const referralInput = document.getElementById("referral");
if (referralInput) {
  referralInput.value = localStorage.getItem("referralCode") || "";
}

// Register
document.getElementById("registerBtn")?.addEventListener("click", async () => {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const referral = document.getElementById("referral")?.value.trim();

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const referralCode = generateReferralCode();

    await setDoc(doc(db, "users", uid), {
      email,
      referralCode,
      referredBy: referral || null,
      referralQualified: false,
      createdAt: serverTimestamp()
    });

    localStorage.removeItem("referralCode");

    window.location.href = "complete-profile.html";

  } catch (error) {
    alert(error.message);
  }
});

// Login
document.getElementById("loginBtn")?.addEventListener("click", async () => {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "catalog.html";

  } catch (error) {
    alert(error.message);
  }
});