// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBgSoU6S30wd2vwvGGZY-Gn-m2HvTot_D8",
  authDomain: "splitwise-cdf05.firebaseapp.com",
  projectId: "splitwise-cdf05",
  storageBucket: "splitwise-cdf05.firebasestorage.app",
  messagingSenderId: "445966740851",
  appId: "1:445966740851:web:66fb95d7c31744af78e906",
  measurementId: "G-QNPWQQM4FZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);