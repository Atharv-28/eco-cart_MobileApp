import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAN5MDYlT4PerdxFCEx3pQ0ENRxQDxZKsw",
  authDomain: "eco-cart-4549d.firebaseapp.com",
  projectId: "eco-cart-4549d",
  storageBucket: "eco-cart-4549d.firebasestorage.app",
  messagingSenderId: "1571542446",
  appId: "1:1571542446:web:4edf5d5e90e540cc2f643f",
  measurementId: "G-QP0YK51BSK"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);