import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const SESSION_COOKIE = "onerio_session";
const ROLE_COOKIE = "onerio_role";

export const AUTH_COOKIES = {
  session: SESSION_COOKIE,
  role: ROLE_COOKIE,
} as const;

export interface VerifiedSession {
  uid: string;
  email: string | null;
  role: string | null;
  name: string | null;
  token: JWTPayload;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(
        "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
      ),
    );
  }
  return jwks;
}

/**
 * Verifica o ID token do Firebase sem service account (JWKS público).
 * Funciona no Edge (middleware) e no Node — adequado ao plano Spark.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<VerifiedSession> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID ausente.");
  }

  const { payload } = await jwtVerify(idToken, getJwks(), {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const uid = typeof payload.sub === "string" ? payload.sub : null;
  if (!uid) throw new Error("Token sem subject (uid).");

  const email = typeof payload.email === "string" ? payload.email : null;
  const name = typeof payload.name === "string" ? payload.name : null;
  const role =
    typeof payload.role === "string"
      ? payload.role
      : null;

  return { uid, email, name, role, token: payload };
}
