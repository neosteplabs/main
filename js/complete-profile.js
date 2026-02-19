import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   ELEMENTS
========================= */

const address1Input = document.getElementById("address1");
const address2Input = document.getElementById("address2");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const zipInput = document.getElementById("zip");
const phoneInput = document.getElementById("phone");
const referralInput = document.getElementById("referralCode");
const saveBtn = document.getElementById("saveProfileBtn");

let currentUser = null;

/* =========================
   AUTH GUARD
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("index.html");
    return;
  }

  currentUser = user;

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      window.location.replace("index.html");
      return;
    }

    // If profile already complete → go to catalog
    if (userDoc.data().profileComplete === true) {
      window.location.replace("catalog.html");
      return;
    }

  } catch (error) {
    console.error("Error checking profile:", error);
  }

});

/* =========================
   SAVE PROFILE
========================= */

saveBtn?.addEventListener("click", async () => {

  if (!currentUser) return;

  const address1 = address1Input.value.trim();
  const address2 = address2Input.value.trim();
  const city = cityInput.value.trim();
  const state = stateInput.value.trim();
  const zip = zipInput.value.trim();
  const phone = phoneInput.value.trim();
  const referral = referralInput ? referralInput.value.trim() : null;

  if (!address1 || !city || !state || !zip || !phone) {
    alert("Please complete all required fields.");
    return;
  }

  try {

    const userDocRef = doc(db, "users", currentUser.uid);

    await updateDoc(userDocRef, {
      address1,
      address2,
      city,
      state,
      zip,
      phone,
      referralCode: referral || null,
      profileComplete: true,
      profileCompletedAt: serverTimestamp()
    });

    // Redirect AFTER successful write
    window.location.replace("catalog.html");

  } catch (error) {
    console.error("Profile save error:", error);
    alert("There was an error saving your profile.");
  }

});
