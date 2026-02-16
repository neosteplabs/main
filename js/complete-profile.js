import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("saveProfile").addEventListener("click", async () => {

  const user = auth.currentUser;
  if (!user) return;

  await updateDoc(doc(db, "users", user.uid), {
    profile: {
      fullName: document.getElementById("fullName").value,
      company: document.getElementById("company").value,
      phone: document.getElementById("phone").value,
      shippingAddress: document.getElementById("shippingAddress").value
    },
    profileComplete: true
  });

  window.location.href = "catalog.html";

});