import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;

/* =========================
   AUTH GUARD
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("index.html");
    return;
  }

  currentUser = user;

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists() || !userDoc.data().profileComplete) {
    window.location.replace("complete-profile.html");
    return;
  }

  renderProducts();
  listenToCart(user.uid);
});

/* =========================
   LOGOUT
========================= */

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("index.html");
});

/* =========================
   PRODUCTS
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
        { compound: product.compound, mg, quantity: qty, price }
      );
    });

    container.appendChild(card);
  });
}

/* =========================
   CART
========================= */

function listenToCart(uid) {

  const cartRef = collection(db, "users", uid, "cart");

  onSnapshot(cartRef, snapshot => {

    let totalQty = 0;
    let totalPrice = 0;

    const cartItemsDiv = document.getElementById("cartItems");
    cartItemsDiv.innerHTML = "";

    snapshot.forEach(docSnap => {

      const item = docSnap.data();
      totalQty += item.quantity;
      totalPrice += item.quantity * item.price;

      const row = document.createElement("div");
      row.className = "cart-item";

      row.innerHTML = `
        <div>
          ${item.compound} ${item.mg}mg
          <div class="mini-qty">
            <button class="decrease">-</button>
            <span>${item.quantity}</span>
            <button class="increase">+</button>
          </div>
        </div>
        <div>$${item.quantity * item.price}</div>
      `;

      row.querySelector(".decrease").addEventListener("click", async () => {
        if (item.quantity > 1) {
          await updateDoc(docSnap.ref, {
            quantity: item.quantity - 1
          });
        } else {
          await deleteDoc(docSnap.ref);
        }
      });

      row.querySelector(".increase").addEventListener("click", async () => {
        await updateDoc(docSnap.ref, {
          quantity: item.quantity + 1
        });
      });

      cartItemsDiv.appendChild(row);
    });

    document.getElementById("cartTotal").textContent =
      `Total: $${totalPrice}`;

    document.getElementById("mobileCartCount").textContent = totalQty;
  });
}

/* =========================
   CART DROPDOWN
========================= */

const mobileBubble = document.getElementById("mobileCartBubble");
const cartDropdown = document.getElementById("cartDropdown");

mobileBubble?.addEventListener("click", (e) => {
  e.stopPropagation();
  cartDropdown.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!cartDropdown.contains(e.target)) {
    cartDropdown.classList.remove("open");
  }
});

/* =========================
   CHECKOUT
========================= */

document.getElementById("goCheckout")?.addEventListener("click", () => {
  window.location.href = "checkout.html";
});