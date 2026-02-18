import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ===============================
   Enable Persistent Login
================================= */
setPersistence(auth, browserLocalPersistence);

/* ===============================
   DOM Elements
================================= */
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authSection = document.getElementById("authSection");
const userEmailDisplay = document.getElementById("userEmail");
const avatarCircle = document.getElementById("avatarCircle");

/* ===============================
   Generate Referral Code
================================= */
function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "NS";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/* ===============================
   REGISTER
================================= */
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const newReferralCode = generateReferralCode();

      await setDoc(doc(db, "users", uid), {
        email,
        referralCode: newReferralCode,
        referredBy: null,
        referralQualified: false,
        profileComplete: false,
        createdAt: serverTimestamp()
      });

      window.location.href = "complete-profile.html";

    } catch (error) {
      alert(error.message);
    }
  });
}

/* ===============================
   LOGIN
================================= */
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // DO NOT redirect here
      // Let auth listener handle redirect safely
    } catch (error) {
      alert(error.message);
    }
  });
}

/* ===============================
   LOGOUT
================================= */
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

/* ===============================
   AUTH STATE LISTENER (MASTER CONTROL)
================================= */
onAuthStateChanged(auth, async (user) => {

  const path = window.location.pathname;

  // 🔒 Not logged in
  if (!user) {
    if (
      path.includes("catalog") ||
      path.includes("account") ||
      path.includes("complete-profile")
    ) {
      window.location.href = "index.html";
    }
    return;
  }

  // 👤 Logged in

  // Hide login section if on index
  if (authSection) {
    authSection.style.display = "none";
  }

  // Show user email
  if (userEmailDisplay) {
    userEmailDisplay.textContent = user.email;
  }

  if (avatarCircle) {
    avatarCircle.textContent = user.email.charAt(0).toUpperCase();
  }

  // Check profile completion
  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (userSnap.exists()) {
    const userData = userSnap.data();

    // 🚨 Profile not complete
    if (!userData.profileComplete &&
        !path.includes("complete-profile")) {
      window.location.href = "complete-profile.html";
      return;
    }

    // ✅ Profile complete
    if (userData.profileComplete &&
        (path.includes("index") || path === "/" || path.endsWith("/docs/"))) {
      window.location.href = "catalog.html";
      return;
    }
  }

});