import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return;

  const data = snap.data();

  document.getElementById("emailDisplay").textContent = user.email;
  document.getElementById("phoneDisplay").textContent = data.phone || "-";

  document.getElementById("addressDisplay").innerHTML =
    `${data.address1 || ""} ${data.address2 || ""}<br>
     ${data.city || ""}, ${data.state || ""} ${data.zip || ""}`;

  document.getElementById("referralDisplay").textContent =
    data.referralCode || "-";

});