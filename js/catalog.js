import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;
let authChecked = false;

/* =========================
   AUTH GUARD (SAFE)
========================= */
onAuthStateChanged(auth, user => {

  if (!authChecked) {
    authChecked = true;

    if (!user) {
      window.location.replace("index.html");
      return;
    }

    currentUser = user;
    renderProducts();
    listenToCart(user.uid);
  }

});

/* =========================
   Logout
========================= */
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("index.html");
});

/* =========================
   Product Data
========================= */
const products = [
  {
    compound: "NS-RT",
    image: "assets/images/ns-rt-10.png",
    prices: { 10: 100, 20: 180, 30: 250 }
  },
  {
    compound: "NS-TZ",
    image: "assets/images/ns-tz-10.png",
    prices: { 10: 110, 20: 200, 30: 280 }
  }
];

/* =========================
   Render Products
========================= */
function renderProducts() {

  const container = document.getElementById("productContainer");
  if (!container) return;

  container.innerHTML = "";

  products.forEach(product => {

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.image}" class="product-image">
      <h2>${product.compound}</h2>

      <select class="mgSelect">
        ${Object.keys(product.prices).map(mg =>
          `<option value="${mg}">
            ${mg} mg - $${product.prices[mg]}
          </option>`
        ).join("")}
      </select>

      <input type="number" class="qtyInput" value="1" min="1">

      <button class="btn addToCart">Add to Cart</button>
    `;

    const addBtn = card.querySelector(".addToCart");
    const mgSelect = card.querySelector(".mgSelect");
    const qtyInput = card.querySelector(".qtyInput");

    addBtn.addEventListener("click", async () => {

      const mg = mgSelect.value;
      const qty = parseInt(qtyInput.value);
      const price = product.prices[mg];
      const itemId = `${product.compound}-${mg}`;

      await setDoc(
        doc(db, "users", currentUser.uid, "cart", itemId),
        {
          compound: product.compound,
          mg,
          quantity: qty,
          price
        }
      );

      alert("Added to cart");

    });

    container.appendChild(card);
  });
}

/* =========================
   Cart Listener
========================= */
function listenToCart(uid) {

  const cartRef = collection(db, "users", uid, "cart");

  onSnapshot(cartRef, snapshot => {

    let totalQty = 0;
    let totalPrice = 0;

    const cartItemsDiv = document.getElementById("cartItems");
    if (!cartItemsDiv) return;

    cartItemsDiv.innerHTML = "";

    snapshot.forEach(docSnap => {

      const item = docSnap.data();
      totalQty += item.quantity;
      totalPrice += item.quantity * item.price;

      const row = document.createElement("div");
      row.className = "cart-item";

      row.innerHTML = `
        <div>
          <strong>${item.compound} ${item.mg}mg</strong>
          <div>Qty: ${item.quantity}</div>
        </div>
        <div>$${item.quantity * item.price}</div>
      `;

      cartItemsDiv.appendChild(row);

    });

    const badge = document.getElementById("cartBadge");

    if (badge) {
      if (totalQty > 0) {
        badge.style.display = "inline-block";
        badge.textContent = totalQty;
      } else {
        badge.style.display = "none";
      }
    }

    const totalEl = document.getElementById("cartTotal");
    if (totalEl) {
      totalEl.textContent = `Total: $${totalPrice}`;
    }

  });
}