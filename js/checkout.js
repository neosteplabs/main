import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let currentUser = null;
let cartItems = [];
let calculatedTotal = 0;

/* =========================
   AUTH GUARD
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.replace("index.html");
    return;
  }

  currentUser = user;

  await loadCheckout();
});


/* =========================
   LOAD & VALIDATE CART
========================= */

async function loadCheckout() {

  const cartRef = collection(db, "users", currentUser.uid, "cart");
  const snapshot = await getDocs(cartRef);

  const orderItemsDiv = document.getElementById("orderItems");
  const orderTotalEl = document.getElementById("orderTotal");

  orderItemsDiv.innerHTML = "";

  cartItems = [];
  calculatedTotal = 0;

  for (const docSnap of snapshot.docs) {

    const cartItem = docSnap.data();
    const productRef = doc(db, "products", cartItem.productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) continue;

    const product = productSnap.data();

    // 🔥 TRUST FIRESTORE PRICE ONLY
    const price = product.price;
    const lineTotal = price * cartItem.quantity;

    calculatedTotal += lineTotal;

    cartItems.push({
      productId: cartItem.productId,
      code: product.code,
      quantity: cartItem.quantity,
      price: price
    });

    const row = document.createElement("div");
    row.className = "checkout-item";
    row.innerHTML = `
      <div>${product.code}</div>
      <div>${cartItem.quantity} x $${price}</div>
      <div>$${lineTotal}</div>
    `;

    orderItemsDiv.appendChild(row);
  }

  orderTotalEl.textContent = `Total: $${calculatedTotal}`;
}


/* =========================
   PLACE ORDER
========================= */

document.getElementById("placeOrderBtn")?.addEventListener("click", async () => {

  if (!cartItems.length) {
    alert("Your cart is empty.");
    return;
  }

  const orderRef = doc(collection(db, "orders"));

  await setDoc(orderRef, {
    userId: currentUser.uid,
    items: cartItems,
    total: calculatedTotal,
    status: "pending",
    createdAt: serverTimestamp()
  });

  // 🔥 Clear cart after successful order
  const cartRef = collection(db, "users", currentUser.uid, "cart");
  const snapshot = await getDocs(cartRef);

  for (const docSnap of snapshot.docs) {
    await deleteDoc(docSnap.ref);
  }

  alert("Order placed successfully!");
  window.location.replace("catalog.html");
});
