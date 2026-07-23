import "server-only";

import { cookies } from "next/headers";
import {
  AUTH_COOKIES,
  verifyFirebaseIdToken,
} from "@/features/auth/session";
import {
  isStaffRole,
  type AppUser,
  type UserRole,
} from "@/features/auth/types";

const SESSION_MAX_AGE = 60 * 60; // 1h — alinhado ao ID token do Firebase

function parseEmailList(envValue: string | undefined): Set<string> {
  return new Set(
    (envValue ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Resolve papel sem Cloud Functions: allowlists no .env + custom claim opcional. */
export function resolveRoleFromAuth(input: {
  email: string | null;
  claimRole?: string | null;
}): UserRole {
  const email = input.email?.toLowerCase() ?? "";
  if (input.claimRole === "admin" || input.claimRole === "operator") {
    return input.claimRole;
  }
  if (email && parseEmailList(process.env.ADMIN_EMAILS).has(email)) {
    return "admin";
  }
  if (email && parseEmailList(process.env.OPERATOR_EMAILS).has(email)) {
    return "operator";
  }
  return "customer";
}

export async function createSessionCookie(idToken: string): Promise<{
  uid: string;
  email: string | null;
  role: UserRole;
}> {
  const verified = await verifyFirebaseIdToken(idToken);
  const role = resolveRoleFromAuth({
    email: verified.email,
    claimRole: verified.role,
  });

  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";

  jar.set(AUTH_COOKIES.session, idToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  jar.set(AUTH_COOKIES.role, role, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return { uid: verified.uid, email: verified.email, role };
}

export async function destroySessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(AUTH_COOKIES.session);
  jar.delete(AUTH_COOKIES.role);
}

export async function getServerSession(): Promise<{
  uid: string;
  email: string | null;
  name: string | null;
  role: UserRole;
} | null> {
  // Export estático (Firebase Hosting Spark): sem cookies no build.
  if (process.env.STATIC_EXPORT === "1") return null;

  const jar = await cookies();
  const token = jar.get(AUTH_COOKIES.session)?.value;
  if (!token) return null;

  try {
    const verified = await verifyFirebaseIdToken(token);
    const role = resolveRoleFromAuth({
      email: verified.email,
      claimRole: verified.role ?? jar.get(AUTH_COOKIES.role)?.value,
    });
    return {
      uid: verified.uid,
      email: verified.email,
      name: verified.name,
      role,
    };
  } catch {
    return null;
  }
}

export async function requireStaffSession() {
  const session = await getServerSession();
  if (!session || !isStaffRole(session.role)) return null;
  return session;
}

export function sessionToAppUser(session: {
  uid: string;
  email: string | null;
  name: string | null;
  role: UserRole;
}): AppUser {
  const now = new Date().toISOString();
  return {
    id: session.uid,
    email: session.email ?? "",
    displayName: session.name ?? session.email?.split("@")[0] ?? "Usuário",
    role: session.role,
    createdAt: now,
    updatedAt: now,
  };
}
