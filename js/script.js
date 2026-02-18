import { auth } from "./firebase-config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ===============================
   Enable Persistent Login
================================= */
setPersistence(auth, browserLocalPersistence);

/* ===============================
   DOM Elements
================================= */
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authSection = document.getElementById("authSection");

const cartIcon = document.getElementById("cartIcon");
const cartBadge = document.getElementById("cartBadge");

const navLinks = document.querySelectorAll(".nav-links li");

/* ===============================
   Helper: Hide Private Nav Items
================================= */
function hidePrivateNav() {
  navLinks.forEach(li => {
    if (li.id !== "cartIcon") {
      li.style.display = "none";
    }
  });

  if (cartIcon) cartIcon.style.display = "none";
}

/* ===============================
   Helper: Show Private Nav Items
================================= */
function showPrivateNav() {
  navLinks.forEach(li => {
    li.style.display = "flex";
  });
}

/* ===============================
   Registration
================================= */
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = "catalog.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

/* ===============================
   Login
================================= */
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "catalog.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

/* ===============================
   Logout
================================= */
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

/* ===============================
   Auth State Listener
================================= */
onAuthStateChanged(auth, (user) => {

  const path = window.location.pathname;

  // 🔒 If NOT logged in
  if (!user) {

    hidePrivateNav();

    if (
      path.includes("catalog") ||
      path.includes("orders")
    ) {
      window.location.href = "index.html";
    }

    if (authSection) {
      authSection.style.display = "block";
    }

    return;
  }

  // 🔓 If logged in
  showPrivateNav();

  if (authSection) {
    authSection.style.display = "none";
  }

/* =========================
   Global Logout Handler
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

});