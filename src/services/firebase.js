import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCxdXEu-HiTO5m4H_vC2QiLgpeoxWqPRwM",
  authDomain: "meatpie-ca.firebaseapp.com",
  projectId: "meatpie-ca",
  storageBucket: "meatpie-ca.firebasestorage.app",
  messagingSenderId: "397071927728",
  appId: "1:397071927728:web:cce0f4def71c7f69666e75",
  measurementId: "G-LFM32EVEMZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };