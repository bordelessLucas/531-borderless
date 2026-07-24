import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { UserRole } from "@/features/auth/types";

/**
 * Resolve o papel direto no Firestore, espelhando `isStaff()` das rules.
 * Necessário no Hosting estático, onde não existe sessão no servidor.
 */
export async function resolveRoleFromFirestore(
  uid: string,
  email: string | null,
): Promise<UserRole> {
  const db = getDb();

  const userSnap = await getDoc(doc(db, COLLECTIONS.users, uid));
  const roleFromDoc = userSnap.data()?.role;
  if (roleFromDoc === "admin" || roleFromDoc === "operator") return roleFromDoc;

  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return "customer";

  const staffSnap = await getDoc(doc(db, COLLECTIONS.config, "staff"));
  const staff = staffSnap.data();
  const adminEmails: unknown = staff?.adminEmails;
  const operatorEmails: unknown = staff?.operatorEmails;

  if (Array.isArray(adminEmails) && adminEmails.includes(normalizedEmail)) {
    return "admin";
  }
  if (Array.isArray(operatorEmails) && operatorEmails.includes(normalizedEmail)) {
    return "operator";
  }
  return "customer";
}
