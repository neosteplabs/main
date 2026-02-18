import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ordersContainer = document.getElementById("ordersContainer");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const ordersRef = collection(db, "users", user.uid, "orders");
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    ordersContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  snapshot.forEach(doc => {
    const order = doc.data();

    const orderDiv = document.createElement("div");
    orderDiv.className = "order-card";

    let itemsHtml = "";
    order.items.forEach(item => {
      itemsHtml += `
        <div class="order-item">
          ${item.name} (${item.mg}) — Qty: ${item.qty}
        </div>
      `;
    });

    orderDiv.innerHTML = `
      <div class="order-header">
        <strong>Order ID:</strong> ${doc.id}
      </div>
      <div><strong>Date:</strong> ${new Date(order.createdAt.seconds * 1000).toLocaleString()}</div>
      <div class="order-items">${itemsHtml}</div>
      <div class="order-total"><strong>Total:</strong> $${order.total}</div>
    `;

    ordersContainer.appendChild(orderDiv);
  });
});