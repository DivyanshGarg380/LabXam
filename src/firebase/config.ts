import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsWmsqSZXJ9yDWbFDBxxMOy4PYwrF6cAQ",
  authDomain: "labxam-35674.firebaseapp.com",
  projectId: "labxam-35674",
  storageBucket: "labxam-35674.firebasestorage.app",
  messagingSenderId: "170378443644",
  appId: "1:170378443644:web:3e6d5bc4c4f73323dd02f9",
  measurementId: "G-L4JSGK6BWT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
