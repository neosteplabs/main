
import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const dropdown = document.querySelector(".dropdown");
const dropdownBtn = document.querySelector(".dropdown > a");

dropdownBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  dropdown.classList.toggle("open");
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  const token = await user.getIdTokenResult();
  if (token.claims.admin) {
    const admin = document.getElementById("adminLink");
    if (admin) admin.style.display = "inline-block";
  }
});
