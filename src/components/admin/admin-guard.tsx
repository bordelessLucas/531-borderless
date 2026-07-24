"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/features/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Proteção do backoffice no client. No Hosting estático não há middleware —
 * a barreira real continua sendo as rules do Firestore.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isStaff, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || user) return;
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [isLoading, user, pathname, router]);

  if (isLoading) {
    return <p className="py-20 text-center text-sm text-ink-muted">Verificando acesso…</p>;
  }

  if (!user) {
    return <p className="py-20 text-center text-sm text-ink-muted">Redirecionando…</p>;
  }

  if (!isStaff) {
    return (
      <Card className="mx-auto mt-20 max-w-lg p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-brand-muted" />
        <h1 className="mt-4 font-display text-xl font-semibold text-ink">
          Acesso restrito à equipe
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          A conta {user.email} não tem permissão de backoffice.
        </p>
        <Link href="/conta" className="mt-6 inline-block">
          <Button variant="secondary">Ir para minha conta</Button>
        </Link>
      </Card>
    );
  }

  return <>{children}</>;
}
