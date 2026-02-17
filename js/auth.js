import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


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
   Capture Referral From URL
================================= */
const params = new URLSearchParams(window.location.search);
if (params.get("ref")) {
  localStorage.setItem("referralCode", params.get("ref"));
}

const referralInput = document.getElementById("referral");
if (referralInput) {
  referralInput.value = localStorage.getItem("referralCode") || "";
}


/* ===============================
   REGISTER
================================= */
document.getElementById("registerBtn")?.addEventListener("click", async () => {

  try {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const referral = document.getElementById("referral")?.value.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const referralCode = generateReferralCode();

    // Create user record
    await setDoc(doc(db, "users", uid), {
      email,
      referralCode,
      referredBy: referral || null,
      referralQualified: false,
      createdAt: serverTimestamp()
    });

    // Create referral tracking record
    await setDoc(doc(db, "referrals", referralCode), {
      ownerUid: uid,
      ownerEmail: email,
      totalReferrals: 0,
      referredUsers: [],
      createdAt: serverTimestamp()
    });

    // If they were referred, update referrer record
    if (referral) {
      const refDoc = await getDoc(doc(db, "referrals", referral));

      if (refDoc.exists()) {
        await updateDoc(doc(db, "referrals", referral), {
          totalReferrals: increment(1),
          referredUsers: arrayUnion(uid)
        });
      }
    }

    localStorage.removeItem("referralCode");

    window.location.href = "complete-profile.html";

  } catch (error) {
    console.error(error);
    alert(error.message);
  }

});


/* ===============================
   LOGIN
================================= */
document.getElementById("loginBtn")?.addEventListener("click", async () => {

  try {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "catalog.html";

  } catch (error) {
    console.error(error);
    alert(error.message);
  }

});


/* ===============================
   AUTH STATE WATCHER
================================= */
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);
  } else {
    console.log("No user logged in.");
  }
});