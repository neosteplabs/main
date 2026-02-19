import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const address1 = document.getElementById("address1");
const address2 = document.getElementById("address2");
const city = document.getElementById("city");
const state = document.getElementById("state");
const zip = document.getElementById("zip");
const phone = document.getElementById("phone");
const referralInput = document.getElementById("referralInput");
const saveBtn = document.getElementById("saveProfileBtn");

/* =========================
   Auth Guard
========================= */

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (userDoc.exists() && userDoc.data().profileComplete) {
    window.location.replace("catalog.html");
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

    await updateDoc(doc(db, "users", user.uid), {
      address1: address1.value.trim(),
      address2: address2.value.trim(),
      city: city.value.trim(),
      state: state.value.trim(),
      zip: zip.value.trim(),
      phone: phone.value.trim(),
      referralUsed: referralInput.value.trim() || null,
      profileComplete: true
    });

    window.location.replace("catalog.html");

  } catch (error) {
    alert("Error saving profile: " + error.message);
  }
});