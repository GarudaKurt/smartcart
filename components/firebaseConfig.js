// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCukvfUhprx5sB0CvIz12m0fd4qpngTH84",
  authDomain: "shoppingcart-9d9ba.firebaseapp.com",
  projectId: "shoppingcart-9d9ba",
  storageBucket: "shoppingcart-9d9ba.appspot.com",
  messagingSenderId: "269001705096",
  appId: "1:269001705096:web:c0ca497f76cf1df04d813d"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(firebaseApp);