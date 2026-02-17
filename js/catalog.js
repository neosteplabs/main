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
   Render Products (LAB STYLE)
========================= */
function renderProducts() {

  const container = document.getElementById("productContainer");
  container.innerHTML = "";

  products.forEach(product => {

    const card = document.createElement("div");
    card.className = "product-card";

    let selection = {}; // Track mg quantities locally

    const mgRows = Object.keys(product.prices).map(mg => {

      selection[mg] = 0;

      return `
        <div class="mg-row" data-mg="${mg}">
          <div class="mg-info">
            <strong>${mg} mg</strong>
            <span>$${product.prices[mg]}</span>
          </div>

          <div class="qty-controls">
            <button class="qty-minus">−</button>
            <span class="qty-value">0</span>
            <button class="qty-plus">+</button>
          </div>
        </div>
      `;
    }).join("");

    card.innerHTML = `
      <img src="${product.image}" class="product-image">
      <h2>${product.compound}</h2>
      <div class="mg-container">
        ${mgRows}
      </div>
      <button class="btn addSelected">Add Selected to Cart</button>
    `;

    /* =========================
       Quantity Logic
    ========================= */
    card.querySelectorAll(".mg-row").forEach(row => {

      const mg = row.dataset.mg;
      const minusBtn = row.querySelector(".qty-minus");
      const plusBtn = row.querySelector(".qty-plus");
      const qtyDisplay = row.querySelector(".qty-value");

      minusBtn.addEventListener("click", () => {
        if (selection[mg] > 0) {
          selection[mg]--;
          qtyDisplay.textContent = selection[mg];
        }
      });

      plusBtn.addEventListener("click", () => {
        selection[mg]++;
        qtyDisplay.textContent = selection[mg];
      });

    });

    /* =========================
       Add Selected To Cart
    ========================= */
    card.querySelector(".addSelected").addEventListener("click", async () => {

      for (const mg in selection) {

        if (selection[mg] > 0) {

          const itemId = `${product.compound}-${mg}`;

          await setDoc(
            doc(db, "users", currentUser.uid, "cart", itemId),
            {
              compound: product.compound,
              mg,
              quantity: selection[mg],
              price: product.prices[mg]
            }
          );

        }
      }

      // Reset local UI quantities
      card.querySelectorAll(".qty-value").forEach(el => el.textContent = "0");
      Object.keys(selection).forEach(mg => selection[mg] = 0);

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

    const badge = document.getElementById("cartBadge");

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
   Drawer Toggle
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
   Auth Guard
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