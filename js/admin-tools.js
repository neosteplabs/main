import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   ADMIN AUTH GUARD
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("index.html");
    return;
  }

  const token = await user.getIdTokenResult();

  if (!token.claims.admin) {
    window.location.replace("catalog.html");
    return;
  }

});

/* =========================
   LOGOUT
========================= */

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("index.html");
});

/* =========================
   TIER RECALCULATION
========================= */

const runBtn = document.getElementById("runMigration");
const output = document.getElementById("output");

runBtn?.addEventListener("click", async () => {

  if (!output) return;

  output.textContent = "Recalculating tier pricing...\n";

  try {

    const snapshot = await getDocs(collection(db, "products"));

    if (snapshot.empty) {
      output.textContent += "No products found.\n";
      return;
    }

    for (const docSnap of snapshot.docs) {

      const data = docSnap.data();

      if (!data.prices || typeof data.prices.public !== "number") {
        output.textContent += `Skipping ${docSnap.id} (no tier structure)\n`;
        continue;
      }

      const publicPrice = data.prices.public;

      const vipPrice = Math.max(publicPrice - 20, 0);
      const familyPrice = Math.max(publicPrice - 30, 0);

      await updateDoc(doc(db, "products", docSnap.id), {
        prices: {
          public: publicPrice,
          vip: vipPrice,
          family: familyPrice
        }
      });

      output.textContent += `Updated ${docSnap.id}\n`;
    }

    output.textContent += "\nRecalculation complete.";

  } catch (error) {
    output.textContent += `\nError: ${error.message}`;
  }

});