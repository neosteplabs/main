import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
  getIdTokenResult
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* =========================
   NAVBAR AUTH + ADMIN LINK
========================= */

const adminLink = document.getElementById("adminLink");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (adminLink) adminLink.style.display = "none";
    return;
  }

  try {
    const token = await getIdTokenResult(user);
    const isAdmin = token.claims.admin === true;

    if (adminLink) {
      adminLink.style.display = isAdmin ? "block" : "none";
    }
  } catch (err) {
    console.error("Admin check failed:", err);
  }
});

/* =========================
   LOGOUT
========================= */

logoutBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = "index.html";
});

/* =========================
   CLICK DROPDOWN SYSTEM
========================= */

const dropdown = document.querySelector(".dropdown");
const toggle = document.querySelector(".dropdown-toggle");
const menu = document.querySelector(".dropdown-menu");

if (dropdown && toggle && menu) {

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });

  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      dropdown.classList.remove("open");
    });
  });
}
