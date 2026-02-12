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

auth.onAuthStateChanged(() => router());
window.addEventListener("hashchange", router);

function router() {
  const content = document.getElementById("content");
  const page = window.location.hash.replace("#", "") || "home";
  const user = auth.currentUser;

  // PUBLIC CONTACT PAGE
  if (page === "contact") {
    content.innerHTML = `
      <div class="glass-panel">
        <h2>Contact NeoStep</h2>
        <p>Email: <strong>neosteplabs@gmail.com</strong></p>
        <p style="margin-top:20px;font-size:0.9rem;opacity:0.8;">
          All products are intended strictly for research use only.
          Not for human or veterinary use.
        </p>
        <p style="margin-top:20px;font-size:0.85rem;opacity:0.7;">
          By accessing this site you acknowledge you are a qualified researcher.
        </p>
      </div>
    `;
    return;
  }

  // PROTECTED CATALOG
  if (page === "catalog") {
    if (!user) {
      content.innerHTML = `
        <div class="glass-panel login-panel">
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
        <section>
          <h1 style="text-align:center;margin-bottom:40px;">Research Compound Catalog</h1>
          <div class="product-grid">${html}</div>
        </section>
      `;
    });

    return;
  }

  // HOME
  content.innerHTML = `
    <div class="glass-panel hero">
      <h1>NeoStep Secure Research Portal</h1>
      <p>Verified laboratory access only.</p>
      <a href="#catalog" class="btn">Access Catalog</a>
    </div>
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
