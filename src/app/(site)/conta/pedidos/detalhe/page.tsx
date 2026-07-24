"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/auth-provider";
import { OrderDetail } from "@/components/account/orders-panel";
import { Button } from "@/components/ui/button";

function OrderDetailScreen() {
  const orderId = useSearchParams().get("id");
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="py-20 text-center text-ink-muted">Carregando…</p>;
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Entre para ver o pedido
        </h1>
        <Link
          href={`/login?next=${encodeURIComponent(
            orderId ? `/conta/pedidos/detalhe?id=${orderId}` : "/conta/pedidos",
          )}`}
          className="mt-6 inline-block"
        >
          <Button>Entrar</Button>
        </Link>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-muted">Pedido não informado.</p>
        <Link href="/conta/pedidos" className="mt-4 inline-block text-brand hover:underline">
          ← Meus pedidos
        </Link>
      </div>
    );
  }

  return <OrderDetail orderId={orderId} />;
}

export default function ContaPedidoDetailPage() {
  return (
    <div className="container py-12">
      <Suspense fallback={<p className="text-sm text-ink-muted">Carregando…</p>}>
        <OrderDetailScreen />
      </Suspense>
    </div>
  );
}
