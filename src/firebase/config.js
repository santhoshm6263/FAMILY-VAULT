import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Vite environment variables with production live Firebase configuration defaults
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyB1DCyoeiaBwB_tk645p18v3mxeJSuG1hY",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "family-vault-98059.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "family-vault-98059",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "family-vault-98059.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1050846106644",
  appId: env.VITE_FIREBASE_APP_ID || "1:1050846106644:web:64ac19451e3904be438301",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-B7SK4QEC08"
};

// Check if actual credentials have been supplied (not empty or default placeholders)
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_project_id' &&
  firebaseConfig.projectId !== 'familyvault-app'
);

let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
} catch (error) {
  console.warn('Firebase initialization notice:', error.message);
}

export { app, auth, db, storage, googleProvider };
export default app;
