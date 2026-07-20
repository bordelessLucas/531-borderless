import type { ID, Timestamps } from "@/features/shared/types";

/** Papéis da plataforma. `customer` = comprador; staff = backoffice. */
export type UserRole = "admin" | "operator" | "customer";

export interface AppUser extends Timestamps {
  id: ID; // = Firebase Auth uid
  email: string;
  displayName: string;
  role: UserRole;
  /** Preferências / metadados leves. */
  phone?: string;
}

export function isStaffRole(role: UserRole | string | undefined | null): boolean {
  return role === "admin" || role === "operator";
}
