// src/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlIlt4PNq5b0WBtnhr51kyVhLL89D7Fds",
  authDomain: "finalstracker.firebaseapp.com",
  projectId: "finalstracker",
  storageBucket: "finalstracker.firebasestorage.app",
  messagingSenderId: "154646803005",
  appId: "1:154646803005:web:6bf78014dd48be6e1cb054"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export everything else so App.jsx can use it
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, getDoc, setDoc };