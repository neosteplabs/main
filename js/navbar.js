import { auth } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  const token = await user.getIdTokenResult(true);
  const isAdmin = token.claims.admin === true;

  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (!dropdownMenu) return;

  if (isAdmin) {
    const toolsLink = document.createElement("a");
    toolsLink.href = "admin-tools.html";
    toolsLink.textContent = "Advanced Tools";

    dropdownMenu.insertBefore(
      toolsLink,
      dropdownMenu.querySelector("#logoutBtn")
    );
  }
});

/* LOGOUT */
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("index.html");
});
