/**
 * Firebase configuration and authentication methods
 * @module FirebaseAuth
 */
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';

/**
 * Firebase configuration object with fallback values
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB0qTBwAf4VfzTNd5awl3E-BoYol454WRU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "linkup-6b684.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "linkup-6b684",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "linkup-6b684.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "35639479371",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:35639479371:web:6937d517b072e89fe151ce",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KJKLEW7DXF"
};

/**
 * Initialize Firebase app
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Auth instance
 */
export const auth = getAuth(app);

/**
 * Google Auth Provider
 */
const googleProvider = new GoogleAuthProvider();

/**
 * Facebook Auth Provider  
 */
const facebookProvider = new FacebookAuthProvider();

/**
 * Login with email and password
 * @param email - User email
 * @param password - User password
 * @returns User credential
 */
export const loginEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Register with email and password
 * @param email - User email
 * @param password - User password
 * @returns User credential
 */
export const registerEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Login with Google
 * @returns User credential
 */
export const loginGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

/**
 * Login with Facebook
 * @returns User credential
 */
export const loginFacebook = async () => {
  return await signInWithPopup(auth, facebookProvider);
};

/**
 * Send password reset email
 * @param email - User email
 * @returns Promise
 */
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

/**
 * Logout user
 * @returns Promise
 */
export const logout = async () => {
  return await signOut(auth);
};

export default app;