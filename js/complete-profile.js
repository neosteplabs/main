import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const saveBtn = document.getElementById("saveProfile");
const logoutBtn = document.getElementById("logoutBtn");

const hasReferralCheckbox = document.getElementById("hasReferral");
const referralInput = document.getElementById("referralCode");
const referralError = document.getElementById("referralError");

/* =========================
   Logout
========================= */
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

/* =========================
   Toggle Referral Field
========================= */
hasReferralCheckbox?.addEventListener("change", () => {
  referralInput.style.display = hasReferralCheckbox.checked ? "block" : "none";
});

/* =========================
   Auth Guard
========================= */
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();

    // Auto-fill if returning
    document.getElementById("address1").value = data.address1 || "";
    document.getElementById("address2").value = data.address2 || "";
    document.getElementById("city").value = data.city || "";
    document.getElementById("state").value = data.state || "";
    document.getElementById("zip").value = data.zip || "";
    document.getElementById("phone").value = data.phone || "";

    if (data.referredBy) {
      hasReferralCheckbox.checked = true;
      referralInput.style.display = "block";
      referralInput.value = data.referredBy;
    }
  }

  saveBtn?.addEventListener("click", async () => {

    const address1 = document.getElementById("address1").value.trim();
    const address2 = document.getElementById("address2").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const referralCode = referralInput.value.trim();

    if (!address1 || !city || !state || !zip || !phone) {
      alert("Please complete all required fields.");
      return;
    }

    await updateDoc(userRef, {
      address1,
      address2,
      city,
      state,
      zip,
      phone,
      referredBy: referralCode || null,
      profileComplete: true,
      profileCompletedAt: serverTimestamp()
    });

    window.location.href = "catalog.html";

  });

});