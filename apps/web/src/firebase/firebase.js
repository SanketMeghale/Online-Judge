import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBW-bRl1wzw1Vq_KmoJFMxvxyjJFwjQibE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "judgo-d908b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "judgo-d908b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "judgo-d908b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "954862605609",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:954862605609:web:b33e090ec0bbdb0dd45338",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VX1LKCYBDF"
};

// Initialize Firebase safely (avoid multiple initializations)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Request email scope for GitHub users
githubProvider.addScope("user:email");
githubProvider.addScope("read:user");

// Custom parameters to ensure Google account picker is always prompt
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Optional Analytics (only in browser environment supporting IndexedDB)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { app, analytics };
