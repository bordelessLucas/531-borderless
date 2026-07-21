import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

let emulatorsConnected = false;

function connectEmulatorsIfNeeded(app: FirebaseApp): void {
  if (!useEmulator || emulatorsConnected || typeof window === "undefined") return;
  connectFirestoreEmulator(getFirestore(app), "127.0.0.1", 8080);
  connectAuthEmulator(getAuth(app), "http://127.0.0.1:9099", { disableWarnings: true });
  connectStorageEmulator(getStorage(app), "127.0.0.1", 9199);
  emulatorsConnected = true;
}

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getDb(): Firestore {
  const app = getFirebaseApp();
  connectEmulatorsIfNeeded(app);
  return getFirestore(app);
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  connectEmulatorsIfNeeded(app);
  return getAuth(app);
}

export function getFirebaseStorage(): FirebaseStorage {
  const app = getFirebaseApp();
  connectEmulatorsIfNeeded(app);
  return getStorage(app);
}
