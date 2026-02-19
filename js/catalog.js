import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut,
  getIdTokenResult
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;
let unsubscribeCart = null;

/* =========================
   NAV TOGGLES
========================= */

const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");
const dropdown = document.querySelector(".dropdown");
const dropdownBtn = document.getElementById("accountDropdownBtn");

hamburgerBtn?.addEventListener("click", () => {
  navMenu?.classList.toggle("open");
});

dropdownBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown?.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!dropdown?.contains(e.target)) {
    dropdown?.classList.remove("open");
  }
});

/* =========================
   AUTH GUARD
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("index.html");
    return;
  }

  currentUser = user;

  const token = await getIdTokenResult(user);
  const adminLink = document.getElementById("adminLink");

  if (token.claims.admin && adminLink) {
    adminLink.style.display = "inline-block";
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists() || !userDoc.data().profileComplete) {
    window.location.replace("complete-profile.html");
    return;
  }

  await renderProducts();
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

async function renderProducts() {

  const container = document.getElementById("productContainer");
  if (!container) return;

  container.innerHTML = "";

  const q = query(
    collection(db, "products"),
    orderBy("displayOrder", "asc")
  );

  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {

    const product = docSnap.data();
    const productId = docSnap.id;

    if (!product.visible) return;

    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.image}" class="product-image">
      <h2>${product.code}</h2>
      <p>${product.description}</p>
      <p><strong>$${product.price}</strong></p>
      <input type="number" class="qtyInput" value="1" min="1">
      <button class="btn addToCart">Add to Cart</button>
    `;

    const addBtn = card.querySelector(".addToCart");
    const qtyInput = card.querySelector(".qtyInput");

    addBtn.addEventListener("click", async () => {

      const qty = parseInt(qtyInput.value) || 1;

      const itemRef = doc(db, "users", currentUser.uid, "cart", productId);
      const existing = await getDoc(itemRef);

      if (existing.exists()) {
        await updateDoc(itemRef, {
          quantity: existing.data().quantity + qty
        });
      } else {
        await setDoc(itemRef, {
          productId,
          code: product.code,
          quantity: qty,
          price: product.price
        });
      }

      qtyInput.value = 1;
    });

    container.appendChild(card);
  });
}

/* =========================
   CART
========================= */

function listenToCart(uid) {

  const cartRef = collection(db, "users", uid, "cart");

  if (unsubscribeCart) unsubscribeCart();

  unsubscribeCart = onSnapshot(cartRef, snapshot => {

    const cartItemsDiv = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotal");
    const mobileCount = document.getElementById("mobileCartCount");

    if (!cartItemsDiv || !cartTotalEl || !mobileCount) return;

    cartItemsDiv.innerHTML = "";

    let totalQty = 0;
    let totalPrice = 0;

    snapshot.forEach(docSnap => {

      const item = docSnap.data();

      totalQty += item.quantity;
      totalPrice += item.quantity * item.price;

      const row = document.createElement("div");
      row.className = "cart-item";

      row.innerHTML = `
        <div>
          ${item.code}
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

    cartTotalEl.textContent = `Total: $${totalPrice}`;
    mobileCount.textContent = totalQty;
    mobileCount.style.display = totalQty > 0 ? "inline-block" : "none";
  });
}
