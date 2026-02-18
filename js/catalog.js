import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;

/* =========================
   Product Definitions
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

      if (!currentUser) return;

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

    const cartItemsDiv = document.getElementById("cartItems");
    const badge = document.getElementById("cartBadge");
    const totalDisplay = document.getElementById("cartTotal");

    if (!cartItemsDiv || !badge || !totalDisplay) return;

    let totalQty = 0;
    let totalPrice = 0;

    cartItemsDiv.innerHTML = "";

    snapshot.forEach(docSnap => {

      const item = docSnap.data();
      totalQty += item.quantity;
      totalPrice += item.quantity * item.price;

      const row = document.createElement("div");
      row.innerHTML = `
        <p>${item.compound} ${item.mg}mg
        (Qty: ${item.quantity}) - $${item.quantity * item.price}</p>
      `;
      cartItemsDiv.appendChild(row);

    });

    if (totalQty > 0) {
      badge.style.display = "inline-block";
      badge.textContent = totalQty;
    } else {
      badge.style.display = "none";
    }

    totalDisplay.textContent = `Total: $${totalPrice}`;
  });
}

/* =========================
   Drawer Toggle
========================= */
const cartIcon = document.getElementById("cartIcon");
const drawer = document.getElementById("cartDrawer");

cartIcon?.addEventListener("click", () => {
  drawer?.classList.toggle("open");
});

document.addEventListener("click", e => {
  if (!drawer?.contains(e.target) && !cartIcon?.contains(e.target)) {
    drawer?.classList.remove("open");
  }
});

/* =========================
   Auth Load (NO REDIRECTS HERE)
========================= */
onAuthStateChanged(auth, user => {

  if (!user) {
    // Let script.js handle redirect logic
    return;
  }

  currentUser = user;
  renderProducts();
  listenToCart(user.uid);

});