import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   AUTH GUARD
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("index.html");
    return;
  }

  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists() || !userDoc.data().profileComplete) {
    window.location.replace("complete-profile.html");
    return;
  }

  loadProfile(userDoc.data());
  loadOrders(user.uid);
});

/* =========================
   LOGOUT
========================= */

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("index.html");
});

/* =========================
   PROFILE
========================= */

function loadProfile(data) {
  document.getElementById("emailDisplay").textContent = data.email || "-";
  document.getElementById("phoneDisplay").textContent = data.phone || "-";
  document.getElementById("addressDisplay").textContent = data.address || "-";
  document.getElementById("referralDisplay").textContent = data.referralCode || "-";
}

/* =========================
   ORDER HISTORY
========================= */

async function loadOrders(uid) {

  const ordersContainer = document.getElementById("ordersContainer");
  ordersContainer.innerHTML = "";

  const ordersRef = collection(db, "users", uid, "orders");
  const snapshot = await getDocs(ordersRef);

  if (snapshot.empty) {
    ordersContainer.innerHTML = "<p>No orders yet.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const order = docSnap.data();

    const div = document.createElement("div");
    div.className = "order-card";

    div.innerHTML = `
      <strong>Order ID:</strong> ${docSnap.id}<br>
      <strong>Total:</strong> $${order.total}<br>
      <strong>Date:</strong> ${order.createdAt?.toDate().toLocaleString() || ""}
      <hr>
    `;

    ordersContainer.appendChild(div);
  });
}

/* =========================
   TABS
========================= */

const profileTabBtn = document.getElementById("profileTabBtn");
const ordersTabBtn = document.getElementById("ordersTabBtn");
const profileSection = document.getElementById("profileSection");
const ordersSection = document.getElementById("ordersSection");

profileTabBtn?.addEventListener("click", () => {
  profileSection.style.display = "block";
  ordersSection.style.display = "none";
  profileTabBtn.classList.add("active");
  ordersTabBtn.classList.remove("active");
});

ordersTabBtn?.addEventListener("click", () => {
  profileSection.style.display = "none";
  ordersSection.style.display = "block";
  ordersTabBtn.classList.add("active");
  profileTabBtn.classList.remove("active");
});