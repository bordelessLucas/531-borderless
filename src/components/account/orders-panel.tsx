"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { Download } from "lucide-react";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/features/auth/auth-provider";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import type { Order } from "@/features/orders/types";
import type { Fulfillment } from "@/features/fulfillment/types";
import { formatMoney } from "@/features/shared/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandIcon } from "@/components/brand/icons";

function asEntity<T extends { id: string }>(
  id: string,
  data: Record<string, unknown>,
): T {
  return { id, ...data } as T;
}

async function fetchOrdersForUser(uid: string, email: string | null): Promise<Order[]> {
  const db = getDb();
  const results = new Map<string, Order>();

  const byUid = await getDocs(
    query(collection(db, COLLECTIONS.orders), where("customerUid", "==", uid)),
  );
  for (const d of byUid.docs) {
    results.set(d.id, asEntity<Order>(d.id, d.data() as Record<string, unknown>));
  }

  if (email) {
    // Pedidos de seed / legado indexados por e-mail (rules permitem dono do e-mail).
    const byEmail = await getDocs(
      query(collection(db, COLLECTIONS.orders), where("customer.email", "==", email)),
    );
    for (const d of byEmail.docs) {
      if (!results.has(d.id)) {
        results.set(d.id, asEntity<Order>(d.id, d.data() as Record<string, unknown>));
      }
    }
  }

  return [...results.values()].sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
  );
}

async function fetchFulfillments(orderId: string): Promise<Fulfillment[]> {
  const db = getDb();
  const constraints: QueryConstraint[] = [where("orderId", "==", orderId)];
  const snap = await getDocs(query(collection(db, COLLECTIONS.fulfillments), ...constraints));
  return snap.docs.map((d) => asEntity<Fulfillment>(d.id, d.data() as Record<string, unknown>));
}

const statusLabel: Record<string, string> = {
  CART: "Carrinho",
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  PROCESSING: "Emitindo bilhetes",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const statusClass: Record<string, string> = {
  COMPLETED: "bg-brand/10 text-brand",
  PAID: "bg-brand/10 text-brand",
  PROCESSING: "bg-brand-muted/15 text-brand-muted",
  AWAITING_PAYMENT: "bg-brand-muted/15 text-brand-muted",
  CANCELLED: "bg-ink/10 text-ink-muted",
  REFUNDED: "bg-ink/10 text-ink-muted",
  CART: "bg-surface-subtle text-ink-muted",
};

export function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchOrdersForUser(user.uid, user.email)
      .then((rows) => {
        if (!cancelled) setOrders(rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar pedidos.");
          setOrders([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!orders) {
    return <p className="text-sm text-ink-muted">Carregando pedidos…</p>;
  }

  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BrandIcon id="chinelo" size="xl" tone="soft" className="mx-auto" />
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">Nenhum pedido ainda</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {ONERIO_VOICE.account.ordersEmpty}
        </p>
        <Link href="/atracoes" className="mt-5 inline-block">
          <Button>{ONERIO_VOICE.cta.exploreAttractions}</Button>
        </Link>
      </Card>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/conta/pedidos/detalhe?id=${order.id}`}>
            <Card className="p-5 transition-colors hover:border-brand">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-subtle">
                    Pedido {order.id}
                  </p>
                  <p className="mt-1 font-medium text-ink">
                    {order.items.map((i) => i.productName).join(", ") || "Pedido"}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[order.status] ?? "bg-surface-subtle text-ink-muted"}`}
                    >
                      {statusLabel[order.status] ?? order.status}
                    </span>
                    {order.createdAt
                      ? ` · ${new Date(order.createdAt).toLocaleDateString("pt-BR")}`
                      : null}
                  </p>
                </div>
                <p className="font-semibold text-ink">{formatMoney(order.total)}</p>
              </div>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const orders = await fetchOrdersForUser(user.uid, user.email);
        const found = orders.find((o) => o.id === orderId) ?? null;
        if (!found) {
          if (!cancelled) {
            setError("Pedido não encontrado.");
            setLoading(false);
          }
          return;
        }
        const fuls = await fetchFulfillments(orderId);
        if (!cancelled) {
          setOrder(found);
          setFulfillments(fuls);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar pedido.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, orderId]);

  if (loading) return <p className="text-sm text-ink-muted">Carregando…</p>;
  if (error || !order) {
    return (
      <div>
        <p className="text-sm text-red-600">{error ?? "Pedido não encontrado."}</p>
        <Link href="/conta/pedidos" className="mt-4 inline-block text-brand hover:underline">
          ← Voltar aos pedidos
        </Link>
      </div>
    );
  }

  const tickets = fulfillments.flatMap((f) =>
    f.ticketAssets.map((asset) => ({
      fulfillment: f,
      asset,
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/conta/pedidos" className="text-sm text-ink-muted hover:text-ink">
          ← Meus pedidos
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
          Pedido {order.id}
        </h1>
        <p className="mt-1 text-ink-muted">
          {statusLabel[order.status] ?? order.status} · {formatMoney(order.total)}
        </p>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Itens</h2>
        <ul className="mt-4 divide-y divide-surface-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span className="text-ink">
                {item.quantity}× {item.productName}
              </span>
              <span className="text-ink-muted">{formatMoney(item.unitPrice)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Bilhetes</h2>
        {tickets.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            Ainda não há bilhetes disponíveis. Assim que a emissão for concluída, o download
            aparece aqui.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tickets.map(({ fulfillment, asset }) => (
              <li
                key={asset.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-subtle px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {fulfillment.snapshot.attractionName}
                  </p>
                  <p className="text-xs text-ink-subtle">{asset.fileName}</p>
                </div>
                {asset.url && asset.url !== "#" ? (
                  <a href={asset.url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" /> Baixar
                    </Button>
                  </a>
                ) : (
                  <span className="text-xs text-ink-subtle">Arquivo de demonstração</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
