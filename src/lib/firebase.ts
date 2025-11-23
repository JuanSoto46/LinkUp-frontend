import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase client configuration.
 * Values come from Vite environment variables.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};


const app = initializeApp(firebaseConfig);

/** Shared Firebase Auth instance. */
export const auth = getAuth(app);

/** Shared Firestore DB instance. */
export const db = getFirestore(app);

/** Manual email/password login. */
export function loginEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Manual email/password registration. */
export function registerEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

/** Google OAuth login. */
const googleProvider = new GoogleAuthProvider();
export function loginGoogle() {
  return signInWithPopup(auth, googleProvider);
}

/** Github OAuth login. */
const githubProvider = new GithubAuthProvider();
export function loginGithub() {
  return signInWithPopup(auth, githubProvider);
}

/** Ask Firebase to send a reset password email. */
export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Change password for currently logged-in user.
 * Requires current password re-authentication.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No authenticated user.");
  }

  const credential = EmailAuthProvider.credential(
    user.email,
    currentPassword
  );

  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

/** Sign out current user. */
export function logout() {
  return signOut(auth);
}

/** Get Firebase ID token so frontend can call the backend API. */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
