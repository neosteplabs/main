import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const adminLink = document.getElementById("adminLink");

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (userDoc.exists() && userDoc.data().admin === true) {
    if (adminLink) adminLink.style.display = "block";
  }
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

