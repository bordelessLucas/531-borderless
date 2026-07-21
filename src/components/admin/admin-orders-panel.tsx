"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { Order, OrderStatus } from "@/features/orders/types";
import { formatMoney } from "@/features/shared/types";
import { Card } from "@/components/ui/card";

function asEntity<T extends { id: string }>(
  id: string,
  data: Record<string, unknown>,
): T {
  return { id, ...data } as T;
}

const statusLabel: Record<OrderStatus, string> = {
  CART: "Carrinho",
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  PROCESSING: "Processando",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const statusClass: Record<OrderStatus, string> = {
  CART: "bg-surface-subtle text-ink-subtle",
  AWAITING_PAYMENT: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-surface-subtle text-ink-subtle",
  REFUNDED: "bg-red-100 text-red-700",
};

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDocs(collection(getDb(), COLLECTIONS.orders))
      .then((snap) => {
        const rows = snap.docs.map((d) =>
          asEntity<Order>(d.id, d.data() as Record<string, unknown>),
        );
        rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
        setOrders(rows);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar pedidos.");
        setOrders([]);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, search]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!orders) return <p className="text-sm text-ink-muted">Carregando pedidos…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente, e-mail ou id"
          className="h-11 min-w-[240px] flex-1 rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "ALL")}
          className="h-11 rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
        >
          <option value="ALL">Todos os status</option>
          {(Object.keys(statusLabel) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border bg-surface-subtle text-xs uppercase text-ink-subtle">
            <tr>
              <th className="px-5 py-3 font-medium">Pedido</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Manual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-surface-subtle">
                <td className="px-5 py-4">
                  <Link
                    href={`/conta/pedidos/${o.id}`}
                    className="font-mono text-xs text-brand hover:underline"
                  >
                    {o.id.slice(0, 10)}…
                  </Link>
                  <p className="text-xs text-ink-subtle">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleString("pt-BR")
                      : "—"}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-ink">{o.customer.name}</p>
                  <p className="text-xs text-ink-subtle">{o.customer.email}</p>
                </td>
                <td className="px-5 py-4 text-ink">{formatMoney(o.total)}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[o.status]}`}
                  >
                    {statusLabel[o.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-ink-muted">
                  {o.hasManualFulfillment ? "Sim" : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-subtle">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
