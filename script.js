// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzrAXCzu2VzxzV02jLW_SpiLJ0mLK8N1g",
  authDomain: "neostep-portal-b9ea3.firebaseapp.com",
  projectId: "neostep-portal-b9ea3",
  storageBucket: "neostep-portal-b9ea3.firebasestorage.app",
  messagingSenderId: "312972875460",
  appId: "1:312972875460:web:b87c32224d0b26b2a09b91"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(async (user) => {
  updateAuthLink(user);
  if (user) await ensureUserRecord(user);
  router();
});

async function ensureUserRecord(user) {
  const userRef = db.collection("users").doc(user.uid);
  const doc = await userRef.get();
  if (!doc.exists) {
    await userRef.set({
      email: user.email,
      approved: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
}

window.addEventListener("hashchange", router);

async function router() {
  const content = document.getElementById("content");
  const page = window.location.hash.replace("#", "") || "home";
  const user = auth.currentUser;

  let approved = false;
  if (user) {
    const doc = await db.collection("users").doc(user.uid).get();
    approved = doc.exists && doc.data().approved === true;
  }

  if (page === "catalog" && user && approved) {

    const productsSnapshot = await db
      .collection("products")
      .where("visible", "==", true)
      .orderBy("createdAt", "desc")
      .get();

    let productHTML = "";

    productsSnapshot.forEach(doc => {
      const product = doc.data();
      productHTML += `
        <div class="product-card">
          <div class="product-image">
            <img src="${product.image}" alt="${product.code}">
          </div>
          <h3>${product.code}</h3>
          <p>${product.description}</p>
        </div>
      `;
    });

    content.innerHTML = `
      <section class="catalog-page">
        <div class="access-banner">🔓 Approved Access</div>
        <h1>Research Compound Catalog</h1>
        <div class="product-grid">
          ${productHTML}
        </div>
      </section>
    `;
    return;
  }

  const pages = {
    home: `
      <section class="hero">
        <h1>NeoStep Secure Research Portal</h1>
        <p>Verified laboratory access only.</p>
        <a href="#catalog" class="btn">Access Catalog</a>
      </section>
    `,
    login: `
      <section class="secure-gate">
        <h1>Email Login Required</h1>
        <form onsubmit="sendMagicLink(event)">
          <input type="email" id="email" required placeholder="Enter your email">
          <button type="submit">Send Login Link</button>
        </form>
      </section>
    `,
    restricted: `
      <section class="secure-gate">
        <h1>Access Restricted</h1>
        <a href="#login" class="btn">Login to Continue</a>
      </section>
    `
  };

  content.innerHTML = pages[page] || pages.home;
}
