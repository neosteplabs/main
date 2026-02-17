import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-TwAcS--pzlfgfyJ9UR_e7DRs6KWo5dw",
  authDomain: "neostep-portal-b9ea3.firebaseapp.com",
  projectId: "neostep-portal-b9ea3",
  storageBucket: "neostep-portal-b9ea3.appspot.com",
  messagingSenderId: "312972875460",
  appId: "1:312972875460:web:b87c32224d0b26b2a09b91"
};

// Initialize Firebase ONCE
const app = initializeApp(firebaseConfig);

// Export shared services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };