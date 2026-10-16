import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || "AIzaSyDQHTW5QeEk0PYvcmhgebf1eGVo3Gk7lhA",
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || "skillbridge-6b9dc.firebaseapp.com",
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || "skillbridge-6b9dc",
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || "skillbridge-6b9dc.firebasestorage.app",
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || "840506861519",
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || "1:840506861519:web:e2744e78139d4ea74bd4ba",
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || "G-S94VLFZ9F2"
};

// Initialize Firebase safely (avoid multi-initialization in Vite HMR)
let app: any;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  console.warn('[Firebase] App initialization warning:', e);
  app = getApps()[0];
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google OAuth parameters
googleProvider.setCustomParameters({
  prompt: 'select_account'
});


export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
};

export type { User };
