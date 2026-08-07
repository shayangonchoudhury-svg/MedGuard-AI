import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDN6gp0OqFaQiebXOfAZA2xXh0GSVrPfeI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "phat-parser-qb2z8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "phat-parser-qb2z8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "phat-parser-qb2z8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "900714263970",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:900714263970:web:f5c73109ab0184cbf1eefb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth provider options
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
