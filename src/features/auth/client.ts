"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { establishSession, clearSession } from "@/features/auth/actions";
import { resolveRoleFromFirestore } from "@/features/auth/role-client";
import type { AppUser, UserRole } from "@/features/auth/types";

async function syncUserDocument(
  user: User,
  roleHint: UserRole = "customer",
): Promise<AppUser> {
  const db = getDb();
  const ref = doc(db, COLLECTIONS.users, user.uid);
  const snap = await getDoc(ref);
  const now = new Date().toISOString();

  if (snap.exists()) {
    const data = snap.data() as Omit<AppUser, "id">;
    // Role no Firestore só sobe via promote-admin / custom claims — nunca auto-escala no client.
    return { id: user.uid, ...data };
  }

  const profile: AppUser = {
    id: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? user.email?.split("@")[0] ?? "Cliente",
    role: roleHint === "admin" || roleHint === "operator" ? roleHint : "customer",
    createdAt: now,
    updatedAt: now,
  };

  // Na criação, rules só permitem role == customer. Staff é promovido depois (script/claims).
  const { id: _id, role: _role, ...safe } = profile;
  await setDoc(ref, { ...safe, role: "customer" });
  return { ...profile, role: "customer" };
}

export async function completeSignIn(user: User): Promise<{
  role: UserRole;
}> {
  await syncUserDocument(user);
  const idToken = await user.getIdToken(true);

  try {
    const result = await establishSession(idToken);
    if (result.ok && result.role) return { role: result.role };
  } catch {
    // Sem runtime de servidor (export estático): segue com o papel do Firestore.
  }

  return { role: await resolveRoleFromFirestore(user.uid, user.email) };
}

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return completeSignIn(cred.user);
}

export async function registerWithEmail(input: {
  name: string;
  email: string;
  password: string;
}) {
  const cred = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    input.email,
    input.password,
  );
  await updateProfile(cred.user, { displayName: input.name });
  return completeSignIn(cred.user);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(getFirebaseAuth(), provider);
  return completeSignIn(cred.user);
}

export async function signOutUser() {
  await signOut(getFirebaseAuth());
  try {
    await clearSession();
  } catch {
    // Export estático: não há cookie de sessão para limpar.
  }
}

export function subscribeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function refreshSessionIfSignedIn() {
  const user = getFirebaseAuth().currentUser;
  if (!user) return null;
  return completeSignIn(user);
}
