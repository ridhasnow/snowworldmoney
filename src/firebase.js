// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWjlYbiXPNEeK6fIxQBG4HbrjUrdzaMU0",
  authDomain: "snowworldmoney.firebaseapp.com",
  projectId: "snowworldmoney",
  storageBucket: "snowworldmoney.firebasestorage.app",
  messagingSenderId:  "717434398741",
  appId: "1:717434398741:web:961698d570c955c7bd461c",
  measurementId: "G-3MLQLVL834"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, analytics };
