import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.neo = { auth, db };

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

document.getElementById("registerBtn")?.addEventListener("click", async () => {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const referral = document.getElementById("referral").value.trim();

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

  await setDoc(doc(db, "referrals", referralCode), {
    ownerUid: uid,
    ownerEmail: email,
    totalReferrals: 0,
    referredUsers: [],
    createdAt: serverTimestamp()
  });

  localStorage.removeItem("referralCode");

  window.location.href = "complete-profile.html";
});