// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBxMg3MLYRTWBw7R2xAnRIWyRVhZoS0u5o",
  authDomain: "teleflix-23ef0.firebaseapp.com",
  projectId: "teleflix-23ef0",
  storageBucket: "teleflix-23ef0.appspot.com",
  messagingSenderId: "702503270630",
  appId: "1:702503270630:web:f0014140d1d8c699c66327",
  measurementId: "G-WHCFSG1H9D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app, auth, db };
