"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  refreshSessionIfSignedIn,
  signOutUser,
  subscribeAuth,
} from "@/features/auth/client";
import type { UserRole } from "@/features/auth/types";

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  isStaff: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialRole = null,
}: {
  children: ReactNode;
  initialRole?: UserRole | null;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(initialRole);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAuth((next) => {
      setUser(next);

      if (!next) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      // Só libera a UI depois de resolver o papel, senão o guard do admin nega acesso.
      setIsLoading(true);
      void refreshSessionIfSignedIn()
        .then((res) => {
          if (res?.role) setRole(res.role);
        })
        .catch(() => {
          /* sessão pode expirar; guard e middleware redirecionam */
        })
        .finally(() => setIsLoading(false));
    });
    return unsub;
  }, []);

  const refresh = useCallback(async () => {
    const res = await refreshSessionIfSignedIn();
    if (res?.role) setRole(res.role);
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      isLoading,
      isStaff: role === "admin" || role === "operator",
      refresh,
      logout,
    }),
    [user, role, isLoading, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return ctx;
}
