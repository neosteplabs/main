import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let unsubscribeOrders = null;

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
  listenToOrders(user.uid);
});


/* =========================
   LOGOUT
========================= */

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("index.html");
});


/* =========================
   PROFILE DISPLAY
========================= */

function loadProfile(data) {

  const fullAddress = `
    ${data.address1 || ""} 
    ${data.address2 || ""} 
    ${data.city || ""}, 
    ${data.state || ""} 
    ${data.zip || ""}
  `.replace(/\s+/g, " ").trim();

  document.getElementById("emailDisplay") &&
    (document.getElementById("emailDisplay").textContent = data.email || "-");

  document.getElementById("phoneDisplay") &&
    (document.getElementById("phoneDisplay").textContent = data.phone || "-");

  document.getElementById("addressDisplay") &&
    (document.getElementById("addressDisplay").textContent = fullAddress || "-");

  document.getElementById("referralDisplay") &&
    (document.getElementById("referralDisplay").textContent = data.referralCode || "-");
}


/* =========================
   ORDER HISTORY (LIVE)
========================= */

function listenToOrders(uid) {

  const ordersContainer = document.getElementById("ordersContainer");
  if (!ordersContainer) return;

  if (unsubscribeOrders) unsubscribeOrders();

  const ordersRef = query(
    collection(db, "users", uid, "orders"),
    orderBy("createdAt", "desc")
  );

  unsubscribeOrders = onSnapshot(ordersRef, snapshot => {

    ordersContainer.innerHTML = "";

    if (snapshot.empty) {
      ordersContainer.innerHTML = "<p>No orders yet.</p>";
      return;
    }

    snapshot.forEach(docSnap => {

      const order = docSnap.data();

      const div = document.createElement("div");
      div.className = "order-card";

      const date =
        order.createdAt && order.createdAt.toDate
          ? order.createdAt.toDate().toLocaleString()
          : "";

      div.innerHTML = `
        <strong>Order ID:</strong> ${docSnap.id}<br>
        <strong>Total:</strong> $${order.total || 0}<br>
        <strong>Date:</strong> ${date}
        <hr>
      `;

      ordersContainer.appendChild(div);
    });
  });
}


/* =========================
   TABS
========================= */

const profileTabBtn = document.getElementById("profileTabBtn");
const ordersTabBtn = document.getElementById("ordersTabBtn");
const profileSection = document.getElementById("profileSection");
const ordersSection = document.getElementById("ordersSection");

function showProfileTab() {
  if (!profileSection || !ordersSection) return;

  profileSection.style.display = "block";
  ordersSection.style.display = "none";

  profileTabBtn?.classList.add("active");
  ordersTabBtn?.classList.remove("active");
}

function showOrdersTab() {
  if (!profileSection || !ordersSection) return;

  profileSection.style.display = "none";
  ordersSection.style.display = "block";

  ordersTabBtn?.classList.add("active");
  profileTabBtn?.classList.remove("active");
}

profileTabBtn?.addEventListener("click", showProfileTab);
ordersTabBtn?.addEventListener("click", showOrdersTab);

// Default tab on load
showProfileTab();