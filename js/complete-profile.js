import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   Elements
========================= */

const address1 = document.getElementById("address1");
const address2 = document.getElementById("address2");
const city = document.getElementById("city");
const state = document.getElementById("state");
const zip = document.getElementById("zip");
const phone = document.getElementById("phone");
const referralInput = document.getElementById("referralInput");
const saveBtn = document.getElementById("saveProfileBtn");

/* =========================
   Auth Guard + Auto Redirect
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("index.html");
    return;
  }

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // If user doc DOES NOT exist (edge case)
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        profileComplete: false,
        createdAt: serverTimestamp()
      });
      return;
    }

    const userData = userSnap.data();

    // If profile already complete → go to catalog
    if (userData.profileComplete === true) {
      window.location.replace("catalog.html");
    }

  } catch (error) {
    console.error("Auth guard error:", error);
  }

});

/* =========================
   Save Profile
========================= */

saveBtn.addEventListener("click", async () => {

  const user = auth.currentUser;
  if (!user) return;

  if (!address1.value || !city.value || !state.value || !zip.value || !phone.value) {
    alert("Please complete all required fields.");
    return;
  }

  try {

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // If document doesn't exist → create it
    if (!userSnap.exists()) {

      await setDoc(userRef, {
        email: user.email,
        address1: address1.value.trim(),
        address2: address2.value.trim(),
        city: city.value.trim(),
        state: state.value.trim(),
        zip: zip.value.trim(),
        phone: phone.value.trim(),
        referralUsed: referralInput.value.trim() || null,
        profileComplete: true,
        createdAt: serverTimestamp()
      });

    } else {

      await updateDoc(userRef, {
        address1: address1.value.trim(),
        address2: address2.value.trim(),
        city: city.value.trim(),
        state: state.value.trim(),
        zip: zip.value.trim(),
        phone: phone.value.trim(),
        referralUsed: referralInput.value.trim() || null,
        profileComplete: true
      });

    }

    // Double check save succeeded
    const verifySnap = await getDoc(userRef);
    if (verifySnap.exists() && verifySnap.data().profileComplete === true) {
      window.location.replace("catalog.html");
    } else {
      alert("Profile saved but verification failed. Refresh and try again.");
    }

  } catch (error) {
    console.error("Save error:", error);
    alert("Error saving profile: " + error.message);
  }

});