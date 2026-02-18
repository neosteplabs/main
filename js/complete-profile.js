import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/* ===============================
   AUTH CHECK
================================= */
onAuthStateChanged(auth, (user) => {

  if (!user) {
    // Not logged in
    window.location.href = "index.html";
    return;
  }

  const saveBtn = document.getElementById("saveProfileBtn");

  saveBtn.addEventListener("click", async () => {

    const name = document.getElementById("name").value.trim();
    const company = document.getElementById("company").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!name || !phone || !address) {
      alert("Please fill all required fields.");
      return;
    }

    try {

      await updateDoc(doc(db, "users", user.uid), {
        name,
        company,
        phone,
        address,
        profileComplete: true
      });

      window.location.href = "catalog.html";

    } catch (error) {
      console.error(error);
      alert("Error saving profile. Check console.");
    }

  });

});