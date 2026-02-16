import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async user => {
  if (!user) return window.location.href = "index.html";

  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.data();

  document.getElementById("myCode").innerText = data.referralCode;

  const refSnap = await getDoc(doc(db, "referrals", data.referralCode));
  document.getElementById("refCount").innerText = refSnap.data().totalReferrals;
});