import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;

/* =========================
   PRODUCT DEFINITIONS
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
   RENDER PRODUCTS
========================= */
function renderProducts() {
  const container = document.getElementById("productContainer");
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

      <button class="btn addToCart">Add to Cart</button>
    `;

    const addBtn = card.querySelector(".addToCart");
    const mgSelect = card.querySelector(".mgSelect");

    addBtn.addEventListener("click", async () => {

      const mg = mgSelect.value;
      const price = product.prices[mg];
      const itemId = `${product.compound}-${mg}`;

      const itemRef = doc(db, "users", currentUser.uid, "cart", itemId);
      const existing = await getDoc(itemRef);

      if (existing.exists()) {
        await updateDoc(itemRef, {
          quantity: existing.data().quantity + 1
        });
      } else {
        await setDoc(itemRef, {
          compound: product.compound,
          mg,
          quantity: 1,
          price
        });
      }

    });

    container.appendChild(card);
  });
}

/* =========================
   CART LISTENER (REALTIME)
========================= */
function listenToCart(uid) {

  const cartRef = collection(db, "users", uid, "cart");

  onSnapshot(cartRef, snapshot => {

    const cartItemsDiv = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const badge = document.getElementById("cartBadge");

    cartItemsDiv.innerHTML = "";

    let totalQty = 0;
    let totalPrice = 0;

    snapshot.forEach(docSnap => {

      const item = docSnap.data();
      const id = docSnap.id;

      totalQty += item.quantity;
      totalPrice += item.quantity * item.price;

      const row = document.createElement("div");
      row.className = "cart-item";

      row.innerHTML = `
        <div class="cart-item-info">
          <strong>${item.compound} ${item.mg}mg</strong>
          <span class="cart-price">$${item.price} each</span>
        </div>

        <div class="cart-controls">
          <button class="cart-btn decrease">−</button>
          <span>${item.quantity}</span>
          <button class="cart-btn increase">+</button>
          <button class="remove-btn">✕</button>
        </div>
      `;

      // Increase
      row.querySelector(".increase").addEventListener("click", async () => {
        await updateDoc(doc(db, "users", uid, "cart", id), {
          quantity: item.quantity + 1
        });
      });

      // Decrease
      row.querySelector(".decrease").addEventListener("click", async () => {
        if (item.quantity > 1) {
          await updateDoc(doc(db, "users", uid, "cart", id), {
            quantity: item.quantity - 1
          });
        } else {
          await deleteDoc(doc(db, "users", uid, "cart", id));
        }
      });

      // Remove
      row.querySelector(".remove-btn").addEventListener("click", async () => {
        await deleteDoc(doc(db, "users", uid, "cart", id));
      });

      cartItemsDiv.appendChild(row);
    });

    // Update badge
    if (totalQty > 0) {
      badge.style.display = "inline-block";
      badge.textContent = totalQty;
    } else {
      badge.style.display = "none";
    }

    cartTotal.innerHTML = `<strong>Total: $${totalPrice}</strong>`;
  });
}

/* =========================
   DRAWER TOGGLE
========================= */
const cartIcon = document.getElementById("cartIcon");
const drawer = document.getElementById("cartDrawer");

cartIcon?.addEventListener("click", () => {
  drawer.classList.toggle("open");
});

document.addEventListener("click", e => {
  if (!drawer.contains(e.target) && !cartIcon.contains(e.target)) {
    drawer.classList.remove("open");
  }
});

/* =========================
   AUTH GUARD
========================= */
onAuthStateChanged(auth, user => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  renderProducts();
  listenToCart(user.uid);

});