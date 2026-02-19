
import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  const isAdmin = user.email === "lurrtopia1@gmail.com";

  if (!isAdmin) {
    window.location.replace("catalog.html");
    return;
  }

  loadProducts();
});

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("index.html");
});

async function loadProducts() {
  const container = document.getElementById("productsContainer");
  container.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("div");
    card.className = "admin-product-card";

    card.innerHTML = `
      <h3>${data.code}</h3>
      <label>Price</label>
      <input type="number" value="${data.price || 0}" class="priceInput">
      <label>Description</label>
      <input type="text" value="${data.description || ""}" class="descInput">
      <label>Display Order</label>
      <input type="number" value="${data.displayOrder || 0}" class="orderInput">
      <label>
        <input type="checkbox" ${data.visible ? "checked" : ""} class="visibleInput">
        Visible
      </label>
      <button class="btn saveBtn">Save</button>
      <hr>
    `;

    card.querySelector(".saveBtn").addEventListener("click", async () => {
      await updateDoc(doc(db, "products", id), {
        price: parseFloat(card.querySelector(".priceInput").value),
        description: card.querySelector(".descInput").value,
        displayOrder: parseInt(card.querySelector(".orderInput").value),
        visible: card.querySelector(".visibleInput").checked
      });
      alert("Saved");
    });

    container.appendChild(card);
  });
}
