import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;

/* =========================
   PRODUCT DATA
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

      if (!currentUser) {
        alert("You must be logged in.");
        return;
      }

      const mg = mgSelect.value;
      const price = product.prices[mg];
      const itemId = `${product.compound}-${mg}`;

      try {

        const cartDocRef = doc(
          db,
          "users",
          currentUser.uid,
          "cart",
          itemId
        );

        const existing = await getDoc(cartDocRef);

        if (existing.exists()) {

          const currentQty = existing.data().quantity;

          await updateDoc(cartDocRef, {
            quantity: currentQty + 1
          });

        } else {

          await setDoc(cartDocRef, {
            compound: product.compound,
            mg,
            quantity: 1,
            price
          });

        }

        alert("Added to cart");

      } catch (err) {
        console.error("Cart error:", err);
        alert("Error adding to cart.");
      }

    });

    container.appendChild(card);
  });
}

/* =========================
   CART LISTENER
========================= */
function listenToCart(uid) {

  const cartRef = collection(db, "users", uid, "cart");

  onSnapshot(cartRef, snapshot => {

    const cartItemsDiv = document.getElementById("cartItems");
    const badge = document.getElementById("cartBadge");

    cartItemsDiv.innerHTML = "";

    let totalQty = 0;
    let totalPrice = 0;

    snapshot.forEach(docSnap => {

      const item = docSnap.data();
      const docId = docSnap.id;

      totalQty += item.quantity;
      totalPrice += item.quantity * item.price;

      const row = document.createElement("div");
      row.className = "cart-row";

      row.innerHTML = `
        <div class="cart-left">
          <strong>${item.compound} ${item.mg}mg</strong>
          <div class="cart-price">$${item.price} each</div>
        </div>

        <div class="cart-right">
          <button class="qty-btn minus">-</button>
          <span class="qty">${item.quantity}</span>
          <button class="qty-btn plus">+</button>
          <button class="remove-btn">×</button>
        </div>
      `;

      const minusBtn = row.querySelector(".minus");
      const plusBtn = row.querySelector(".plus");
      const removeBtn = row.querySelector(".remove-btn");

      minusBtn.addEventListener("click", async () => {

        if (item.quantity > 1) {
          await updateDoc(
            doc(db, "users", uid, "cart", docId),
            { quantity: item.quantity - 1 }
          );
        } else {
          await deleteDoc(
            doc(db, "users", uid, "cart", docId)
          );
        }

      });

      plusBtn.addEventListener("click", async () => {

        await updateDoc(
          doc(db, "users", uid, "cart", docId),
          { quantity: item.quantity + 1 }
        );

      });

      removeBtn.addEventListener("click", async () => {

        await deleteDoc(
          doc(db, "users", uid, "cart", docId)
        );

      });

      cartItemsDiv.appendChild(row);
    });

    /* Update badge */
    if (totalQty > 0) {
      badge.style.display = "inline-block";
      badge.textContent = totalQty;
    } else {
      badge.style.display = "none";
    }

    document.getElementById("cartTotal").textContent =
      `Total: $${totalPrice}`;

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