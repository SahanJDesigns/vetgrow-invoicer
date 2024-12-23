// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
const firebaseConfig = {
    apiKey: "AIzaSyB-CPvVvgcKJPkeYQ7Of64aC-gOwB7A200",
    authDomain: "vetgrow-invoicer.firebaseapp.com",
    projectId: "vetgrow-invoicer",
    storageBucket: "vetgrow-invoicer.firebasestorage.app",
    messagingSenderId: "732975351216",
    appId: "1:732975351216:web:b23177c0df3c0d3ab48275",
    measurementId: "G-XQ689DQF1Q"
};

// Initialize Firebase
export const firebase_app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(firebase_app);
export const firebase_auth = getAuth(firebase_app);
export  const firebase_db = getFirestore(firebase_app);
