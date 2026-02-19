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

const form = document.getElementById("profileForm");

const address1 = document.getElementById("address1");
const address2 = document.getElementById("address2");
const city = document.getElementById("city");
const state = document.getElementById("state");
const zip = document.getElementById("zip");
const phone = document.getElementById("phone");
const referralInput = document.getElementById("referralInput");

let currentUser = null;

/* =========================
   AUTH CHECK + PREFILL
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("index.html");
    return;
  }

  currentUser = user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.error("User document missing.");
    return;
  }

  const data = userSnap.data();

  // If already completed → go to catalog
  if (data.profileComplete === true) {
    window.location.replace("catalog.html");
    return;
  }

  // Prefill if partial data exists
  address1.value = data.address1 || "";
  address2.value = data.address2 || "";
  city.value = data.city || "";
  state.value = data.state || "";
  zip.value = data.zip || "";
  phone.value = data.phone || "";
});

/* =========================
   SAVE PROFILE
========================= */

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) return;

  try {

    const userRef = doc(db, "users", currentUser.uid);

    await updateDoc(userRef, {
      address1: address1.value.trim(),
      address2: address2.value.trim(),
      city: city.value.trim(),
      state: state.value.trim(),
      zip: zip.value.trim(),
      phone: phone.value.trim(),
      profileComplete: true,
      profileCompletedAt: serverTimestamp()
    });

    // Success → go to catalog
    window.location.replace("catalog.html");

  } catch (error) {
    console.error("Profile save error:", error);
    alert("Error saving profile. Check console.");
  }
});