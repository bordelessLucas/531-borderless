"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContaPage() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return <p className="container py-20 text-center text-ink-muted">Carregando…</p>;
  }

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Minha conta</h1>
        <p className="mt-2 text-ink-muted">Entre para ver pedidos e bilhetes.</p>
        <Link href="/login?next=/conta" className="mt-6 inline-block">
          <Button>Entrar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Olá, {user.displayName ?? "cliente"}
        </h1>
        <p className="mt-1 text-ink-muted">{user.email}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Meus pedidos</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Acompanhe status e baixe bilhetes emitidos.
          </p>
          <Link href="/conta/pedidos" className="mt-5 inline-block">
            <Button>Ver pedidos</Button>
          </Link>
        </Card>

        {role === "admin" || role === "operator" ? (
          <Card className="p-6">
            <h2 className="font-display text-xl font-semibold text-ink">Backoffice</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Você tem acesso staff ({role}).
            </p>
            <Link href="/admin" className="mt-5 inline-block">
              <Button variant="secondary">Abrir admin</Button>
            </Link>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
