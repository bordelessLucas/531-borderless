"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ArrowRight, Building2, Inbox, MapPinned, Ticket } from "lucide-react";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { Fulfillment } from "@/features/fulfillment/types";
import { FulfillmentQueue } from "@/components/admin/fulfillment-queue";
import { Card } from "@/components/ui/card";

function asEntity<T extends { id: string }>(id: string, data: Record<string, unknown>): T {
  return { id, ...data } as T;
}

async function loadManualQueue(): Promise<Fulfillment[]> {
  const rank: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 1,
    FAILED: 2,
    ISSUED: 3,
    DELIVERED: 4,
    CANCELLED: 5,
  };
  const snap = await getDocs(
    query(collection(getDb(), COLLECTIONS.fulfillments), where("strategy", "==", "MANUAL")),
  );
  return snap.docs
    .map((d) => asEntity<Fulfillment>(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9));
}

export function AdminQueueLoader() {
  const [items, setItems] = useState<Fulfillment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManualQueue()
      .then(setItems)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar fila.");
        setItems([]);
      });
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!items) return <p className="text-sm text-ink-muted">Carregando fila…</p>;
  return <FulfillmentQueue items={items} />;
}

const STAT_ICONS = {
  attractions: MapPinned,
  passports: Ticket,
  partners: Building2,
  queue: Inbox,
} as const;

export type AdminStatIcon = keyof typeof STAT_ICONS;

export function AdminPendingSummary({
  stats,
}: {
  stats: { label: string; value: number; icon: AdminStatIcon; href: string }[];
}) {
  const [pending, setPending] = useState<Fulfillment[]>([]);

  useEffect(() => {
    loadManualQueue()
      .then((rows) =>
        setPending(rows.filter((f) => f.status === "PENDING" || f.status === "PROCESSING")),
      )
      .catch(() => setPending([]));
  }, []);

  const withQueue = stats.map((s) =>
    s.href === "/admin/fila" ? { ...s, value: pending.length } : s,
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {withQueue.map((stat) => {
          const Icon = STAT_ICONS[stat.icon];
          return (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-5 transition-colors hover:border-brand">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-ink-subtle" />
              </div>
              <p className="mt-4 font-display text-3xl font-semibold text-ink">{stat.value}</p>
              <p className="text-sm text-ink-muted">{stat.label}</p>
            </Card>
          </Link>
          );
        })}
      </div>

      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Emissões pendentes</h2>
          <Link href="/admin/fila" className="text-sm font-medium text-brand hover:underline">
            Abrir fila
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-surface-border">
          {pending.map((f) => (
            <li key={f.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-ink">{f.snapshot.attractionName}</p>
                <p className="text-xs text-ink-subtle">
                  {f.snapshot.customerName} · {f.snapshot.quantity} ingresso(s) · pedido {f.orderId}
                </p>
              </div>
              <span className="rounded-full bg-brand-muted/15 px-3 py-1 text-xs font-medium text-brand-muted">
                {f.status === "PENDING" ? "Pendente" : "Em emissão"}
              </span>
            </li>
          ))}
          {pending.length === 0 ? (
            <li className="py-3 text-sm text-ink-subtle">Nenhuma emissão pendente.</li>
          ) : null}
        </ul>
      </Card>
    </>
  );
}

