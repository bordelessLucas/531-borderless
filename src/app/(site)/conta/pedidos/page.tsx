"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/auth-provider";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { OrdersList } from "@/components/account/orders-panel";
import { Button } from "@/components/ui/button";

export default function ContaPedidosPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="container py-20 text-center text-ink-muted">Carregando…</p>;
  }

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Meus pedidos</h1>
        <p className="mt-2 text-ink-muted">Entre para acompanhar seus pedidos.</p>
        <Link href="/login?next=/conta/pedidos" className="mt-6 inline-block">
          <Button>Entrar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Meus pedidos</h1>
        <p className="mt-1 text-ink-muted">{ONERIO_VOICE.account.ordersSupport}</p>
      </header>
      <OrdersList />
    </div>
  );
}
