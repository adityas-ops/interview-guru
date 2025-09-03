import Constants from "expo-constants";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // console.log('Firebase app initialized');
} else {
  app = getApps()[0];
  // console.log('Using existing Firebase app');
}

// Initialize auth - Firebase will handle persistence automatically
let auth: Auth;
try {
  // Try to get existing auth instance
  auth = getAuth(app);
  // console.log('Using existing Firebase auth instance');
} catch (error) {
  // If no auth instance exists, create one
  console.log('Creating new Firebase auth instance');
  auth = initializeAuth(app, {});
}

console.log('Firebase auth configured');

export { auth };
export const db: Firestore = getFirestore(app);
export default app;
