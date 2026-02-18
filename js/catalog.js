import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc
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
  container.innerHTML = "";

  products.forEach(product => {

    const card = document.createElement("div");
    card.className = "compound-card";

    card.innerHTML = `
      <img src="${product.image}" class="compound-image">
      <h2>${product.compound}</h2>
      <div class="strength-container"></div>
      <button class="btn addSelected">Add Selected to Cart</button>
    `;

    const strengthContainer = card.querySelector(".strength-container");

    Object.keys(product.prices).forEach(mg => {

      const row = document.createElement("div");
      row.className = "strength-row";

      row.innerHTML = `
        <span>${mg} mg</span>
        <span>$${product.prices[mg]}</span>
        <div class="stepper">
          <button class="minus">–</button>
          <span class="qty" data-mg="${mg}">0</span>
          <button class="plus">+</button>
        </div>
      `;

      const minus = row.querySelector(".minus");
      const plus = row.querySelector(".plus");
      const qtyDisplay = row.querySelector(".qty");

      plus.addEventListener("click", () => {
        qtyDisplay.textContent = parseInt(qtyDisplay.textContent) + 1;
      });

      minus.addEventListener("click", () => {
        const current = parseInt(qtyDisplay.textContent);
        if (current > 0) {
          qtyDisplay.textContent = current - 1;
        }
      });

      strengthContainer.appendChild(row);
    });

    const addBtn = card.querySelector(".addSelected");

    addBtn.addEventListener("click", async () => {

      const qtyElements = card.querySelectorAll(".qty");

      for (let el of qtyElements) {
        const mg = el.dataset.mg;
        const qty = parseInt(el.textContent);

        if (qty > 0) {

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

          el.textContent = "0";
        }
      }

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
      const itemId = docSnap.id;

      totalQty += item.quantity;
      totalPrice += item.quantity * item.price;

      const row = document.createElement("div");
      row.className = "cart-row";

      row.innerHTML = `
        <div>
          <strong>${item.compound} ${item.mg}mg</strong><br>
          Qty: ${item.quantity}
        </div>
        <div>
          $${item.quantity * item.price}
          <button class="removeBtn">✕</button>
        </div>
      `;

      row.querySelector(".removeBtn").addEventListener("click", async () => {
        await deleteDoc(doc(db, "users", uid, "cart", itemId));
      });

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
   Auth Guard + Approval Check
========================= */
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists() || snap.data().approved !== true) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  renderProducts();
  listenToCart(user.uid);
});