import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
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

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create minimal user record if missing
      await setDoc(userRef, {
        email: user.email,
        profileComplete: false,
        createdAt: serverTimestamp()
      });
      return;
    }

    const userData = userSnap.data();

    // If already complete → go to catalog
    if (userData.profileComplete === true) {
      window.location.replace("catalog.html");
      return;
    }

  } catch (error) {
    console.error("Auth guard error:", error);
  }

});


/* =========================
   SAVE PROFILE
========================= */

saveBtn?.addEventListener("click", async () => {

  if (!currentUser) {
    alert("User session expired. Please log in again.");
    window.location.replace("index.html");
    return;
  }

  const address1 = address1Input?.value.trim() || "";
  const address2 = address2Input?.value.trim() || "";
  const city = cityInput?.value.trim() || "";
  const state = stateInput?.value.trim() || "";
  const zip = zipInput?.value.trim() || "";
  const phone = phoneInput?.value.trim() || "";
  const referralCode = referralInput?.value.trim() || "";

  if (!address1 || !city || !state || !zip || !phone) {
    alert("Please complete all required fields.");
    return;
  }

  try {

    const userRef = doc(db, "users", currentUser.uid);

    await updateDoc(userRef, {
      address1,
      address2,
      city,
      state,
      zip,
      phone,
      referralCode,
      profileComplete: true,
      profileCompletedAt: serverTimestamp()
    });

    window.location.replace("catalog.html");

  } catch (error) {

    console.error("Save profile error:", error);
    alert("There was an issue saving your profile. Please try again.");

  }

});