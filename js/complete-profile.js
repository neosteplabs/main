import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   Protect Page
========================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

/* =========================
   Save Profile
========================= */
const saveBtn = document.getElementById("saveProfileBtn");

saveBtn?.addEventListener("click", async () => {

  const name = document.getElementById("name")?.value.trim();
  const company = document.getElementById("company")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const address = document.getElementById("address")?.value.trim();

  if (!name || !phone || !address) {
    alert("Please complete all required fields.");
    return;
  }

  try {
    const user = auth.currentUser;

    await updateDoc(doc(db, "users", user.uid), {
      name,
      company: company || "",
      phone,
      address,
      profileComplete: true
    });

    window.location.href = "catalog.html";

  } catch (error) {
    console.error(error);
    alert(error.message);
  }

});