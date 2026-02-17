import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ========================
   REGISTER
======================== */

document.getElementById("registerBtn")?.addEventListener("click", async () => {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    await setDoc(doc(db, "users", uid), {
      email,
      createdAt: serverTimestamp()
    });

    window.location.href = "catalog.html";

  } catch (err) {
    alert(err.message);
  }
});

/* ========================
   LOGIN
======================== */

document.getElementById("loginBtn")?.addEventListener("click", async () => {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    await signInWithEmailAndPassword(auth, email, password);

    window.location.href = "catalog.html";

  } catch (err) {
    alert(err.message);
  }
});

/* ========================
   LOGOUT
======================== */

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

/* ========================
   SESSION PROTECTION
======================== */

onAuthStateChanged(auth, (user) => {

  // If user is NOT logged in and trying to access catalog
  if (!user && window.location.pathname.includes("catalog")) {
    window.location.href = "index.html";
  }

  // If user IS logged in and on index page, hide auth section
  if (user && window.location.pathname.includes("index")) {
    const authSection = document.getElementById("authSection");
    if (authSection) authSection.style.display = "none";
  }

});