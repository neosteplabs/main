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

  if (user) {
    await ensureUserRecord(user);
  }

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
        <div class="secure-header">📧 Email Login Required</div>
        <h1>Enter Your Email</h1>
        <form onsubmit="sendMagicLink(event)">
          <input type="email" id="email" required placeholder="Enter your email">
          <button type="submit">Send Login Link</button>
          <p id="login-message" class="error-message"></p>
        </form>
      </section>
    `,
    restricted: `
      <section class="secure-gate">
        <div class="secure-header">🔒 Access Restricted</div>
        <a href="#login" class="btn">Login to Continue</a>
      </section>
    `
  };

  if (page === "catalog") {
    content.innerHTML = pages.restricted;
  } else {
    content.innerHTML = pages[page] || pages.home;
  }
}

function sendMagicLink(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;

  const actionCodeSettings = {
    url: "https://neosteplabs.github.io/docs",
    handleCodeInApp: true
  };

  auth.sendSignInLinkToEmail(email, actionCodeSettings)
    .then(() => {
      window.localStorage.setItem('emailForSignIn', email);
      document.getElementById("login-message").innerText =
        "Login link sent. Check your email.";
    });
}

if (auth.isSignInWithEmailLink(window.location.href)) {
  let email = window.localStorage.getItem('emailForSignIn');
  if (!email) email = window.prompt('Confirm your email');

  auth.signInWithEmailLink(email, window.location.href)
    .then(() => {
      window.localStorage.removeItem('emailForSignIn');
      window.location.hash = "catalog";
    });
}

function logout() {
  auth.signOut().then(() => {
    window.location.hash = "home";
  });
}

function updateAuthLink(user) {
  const authLink = document.getElementById("auth-link");
  if (!authLink) return;

  if (user) {
    authLink.innerHTML = `<a href="#" onclick="logout()">Logout</a>`;
  } else {
    authLink.innerHTML = `<a href="#login">Login</a>`;
  }
}
