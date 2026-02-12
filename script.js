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

auth.onAuthStateChanged(user => router());

window.addEventListener("hashchange", router);

function router() {
  const content = document.getElementById("content");
  const page = window.location.hash.replace("#", "") || "home";
  const user = auth.currentUser;

  if (page === "catalog") {
    if (!user) {
      content.innerHTML = `
        <div class="login-panel">
          <h2>Secure Access Required</h2>
          <p>Enter your email to receive a login link.</p>
          <input type="email" id="email" placeholder="Email address">
          <button onclick="sendLink()">Send Login Link</button>
          <p id="message"></p>
        </div>
      `;
      return;
    }

    db.collection("products").where("visible","==",true).get().then(snapshot => {
      let html = "";
      snapshot.forEach(doc => {
        const p = doc.data();
        html += `
          <div class="product-card">
            <div class="product-image">
              <img src="${p.image}" alt="${p.code}">
            </div>
            <h3>${p.code}</h3>
            <p>${p.description}</p>
          </div>
        `;
      });

      content.innerHTML = `
        <section class="catalog-page">
          <h1>Research Compound Catalog</h1>
          <div class="product-grid">${html}</div>
        </section>
      `;
    });

    return;
  }

  content.innerHTML = `
    <section class="hero">
      <h1>NeoStep Secure Research Portal</h1>
      <p>Verified laboratory access only.</p>
      <a href="#catalog" class="btn">Access Catalog</a>
    </section>
  `;
}

function sendLink() {
  const email = document.getElementById("email").value;

  const actionCodeSettings = {
    url: window.location.origin + window.location.pathname,
    handleCodeInApp: true
  };

  auth.sendSignInLinkToEmail(email, actionCodeSettings)
    .then(() => {
      window.localStorage.setItem('emailForSignIn', email);
      document.getElementById("message").innerText = "Login link sent. Check your email.";
    });
}

if (auth.isSignInWithEmailLink(window.location.href)) {
  let email = window.localStorage.getItem('emailForSignIn');
  if (!email) email = window.prompt('Confirm your email');

  auth.signInWithEmailLink(email, window.location.href)
    .then(() => {
      window.localStorage.removeItem('emailForSignIn');
      window.location.hash = "#catalog";
    });
}

router();
