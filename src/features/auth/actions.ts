"use server";

import { createSessionCookie, destroySessionCookie } from "@/features/auth/server";
import type { UserRole } from "@/features/auth/types";

export async function establishSession(idToken: string): Promise<{
  ok: boolean;
  role?: UserRole;
  message?: string;
}> {
  try {
    const session = await createSessionCookie(idToken);
    return { ok: true, role: session.role };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao criar sessão.";
    return { ok: false, message };
  }
}

export async function clearSession(): Promise<void> {
  await destroySessionCookie();
}
