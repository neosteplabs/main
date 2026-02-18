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
      // Do NOT redirect here
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
   AUTH STATE CONTROLLER
================================= */
onAuthStateChanged(auth, async (user) => {

  const page = window.location.pathname.split("/").pop();
  // page will be:
  // index.html
  // catalog.html
  // complete-profile.html
  // "" (for /docs/)

  if (!user) {
    if (page === "catalog.html" || page === "complete-profile.html") {
      window.location.href = "index.html";
    }
    return;
  }

  // Hide login section if exists
  if (authSection) {
    authSection.style.display = "none";
  }

  if (userEmailDisplay) {
    userEmailDisplay.textContent = user.email;
  }

  if (avatarCircle) {
    avatarCircle.textContent = user.email.charAt(0).toUpperCase();
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (!userSnap.exists()) return;

  const userData = userSnap.data();

  // 🚨 If profile not complete
  if (!userData.profileComplete) {
    if (page !== "complete-profile.html") {
      window.location.href = "complete-profile.html";
    }
    return;
  }

  // ✅ If profile complete and on index
  if (page === "index.html" || page === "") {
    window.location.href = "catalog.html";
  }

});