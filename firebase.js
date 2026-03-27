import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, doc, updateDoc, increment, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCKMzqMBkRBOc9XJ1fDrH3LZ4HfltWVDmA",
    authDomain: "rentmap-live.firebaseapp.com",
    projectId: "rentmap-live",
    storageBucket: "rentmap-live.firebasestorage.app",
    messagingSenderId: "1018484183886",
    appId: "1:1018484183886:web:b8e8236196e434187d041f"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Exporting Firebase tools so other modules can use them
export { collection, addDoc, onSnapshot, query, where, doc, updateDoc, increment, getDocs, deleteDoc, RecaptchaVerifier, signInWithPhoneNumber, signOut };
