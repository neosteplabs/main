
import { getAuth, onAuthStateChanged, signOut } from 
"https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const auth = getAuth();

onAuthStateChanged(auth, user => {
  if (!user) return;

  const adminLink = document.getElementById("adminLink");
  if (user.email === "lurrtopia1@gmail.com" && adminLink) {
    adminLink.style.display = "block";
  }
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});
