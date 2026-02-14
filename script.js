import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDl54NMHQfCYLd2m10X4J5wjEBsQn9mkcg",
  authDomain: "neostep-portal-b9ea3.firebaseapp.com",
  projectId: "neostep-portal-b9ea3",
  storageBucket: "neostep-portal-b9ea3.appspot.com",
  messagingSenderId: "312972875460",
  appId: "1:312972875460:web:b87c32224d0b26b2a09b91"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");
const accountEmail = document.getElementById("accountEmail");
const authSection = document.getElementById("authSection");

if (registerBtn) {
  registerBtn.addEventListener("click", () => {
    createUserWithEmailAndPassword(auth,
      document.getElementById("email").value,
      document.getElementById("password").value
    );
  });
}

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    signInWithEmailAndPassword(auth,
      document.getElementById("email").value,
      document.getElementById("password").value
    ).then(() => window.location.href = "catalog.html");
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "index.html");
  });
}

onAuthStateChanged(auth, (user) => {
  const path = window.location.pathname;

  if (!user && path.includes("catalog")) {
    window.location.href = "index.html";
  }

  if (user) {
    if (userEmail) userEmail.textContent = user.email;
    if (accountEmail) accountEmail.textContent = user.email;
    if (authSection) authSection.style.display = "none";
  }
});