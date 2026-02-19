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

/* =====================================================
   ELEMENTS
===================================================== */

const address1Input = document.getElementById("address1");
const address2Input = document.getElementById("address2");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const zipInput = document.getElementById("zip");
const phoneInput = document.getElementById("phone");
const referralInput = document.getElementById("referralCode");
const saveBtn = document.getElementById("saveProfileBtn");

/* =====================================================
   AUTH GUARD
===================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("index.html");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // If profile already completed → go to catalog
  if (userSnap.exists() && userSnap.data().profileComplete === true) {
    window.location.replace("catalog.html");
    return;
  }

});

/* =====================================================
   SAVE PROFILE
===================================================== */

saveBtn?.addEventListener("click", async () => {

  const user = auth.currentUser;

  if (!user) {
    window.location.replace("index.html");
    return;
  }

  const address1 = address1Input.value.trim();
  const address2 = address2Input.value.trim();
  const city = cityInput.value.trim();
  const state = stateInput.value.trim();
  const zip = zipInput.value.trim();
  const phone = phoneInput.value.trim();
  const referralCode = referralInput.value.trim();

  // Basic validation
  if (!address1 || !city || !state || !zip || !phone) {
    alert("Please complete all required fields.");
    return;
  }

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // If user doc somehow doesn't exist, create it
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        createdAt: serverTimestamp(),
        referralCode: "",
        profileComplete: false
      });
    }

    // Update profile fields
    await updateDoc(userRef, {
      address1,
      address2,
      city,
      state,
      zip,
      phone,
      referralCode: referralCode || userSnap.data()?.referralCode || "",
      profileComplete: true,
      profileCompletedAt: serverTimestamp()
    });

    // Force reload auth state before redirect
    await user.reload();

    window.location.replace("catalog.html");

  } catch (error) {
    console.error(error);
    alert("Error saving profile. Please try again.");
  }

});