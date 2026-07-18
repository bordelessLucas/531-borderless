"use client";

import { useState } from "react";
import { Copy, FileUp, UserCog } from "lucide-react";
import type { Fulfillment, FulfillmentStatus } from "@/features/fulfillment/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusStyle: Record<FulfillmentStatus, { label: string; className: string }> = {
  PENDING: { label: "Pendente", className: "bg-amber-100 text-amber-700" },
  PROCESSING: { label: "Em emissão", className: "bg-blue-100 text-blue-700" },
  ISSUED: { label: "Emitido", className: "bg-emerald-100 text-emerald-700" },
  DELIVERED: { label: "Entregue", className: "bg-emerald-100 text-emerald-700" },
  FAILED: { label: "Falhou", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Cancelado", className: "bg-surface-subtle text-ink-subtle" },
};

export function FulfillmentQueue({ items }: { items: Fulfillment[] }) {
  const [selected, setSelected] = useState<Fulfillment | null>(items[0] ?? null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <Card className="divide-y divide-surface-border">
        {items.map((f) => {
          const s = statusStyle[f.status];
          return (
            <button
              key={f.id}
              onClick={() => setSelected(f)}
              className={cn(
                "flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors",
                selected?.id === f.id ? "bg-surface-subtle" : "hover:bg-surface-subtle",
              )}
            >
              <div>
                <p className="text-sm font-medium text-ink">{f.snapshot.attractionName}</p>
                <p className="text-xs text-ink-subtle">
                  {f.snapshot.customerName} · pedido {f.orderId} · {f.snapshot.quantity}x {f.snapshot.ticketTypeName}
                </p>
              </div>
              <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium", s.className)}>{s.label}</span>
            </button>
          );
        })}
        {items.length === 0 ? <p className="px-5 py-8 text-center text-sm text-ink-subtle">Fila vazia.</p> : null}
      </Card>

      {selected ? <FulfillmentDetail fulfillment={selected} /> : null}
    </div>
  );
}

function FulfillmentDetail({ fulfillment }: { fulfillment: Fulfillment }) {
  const { snapshot } = fulfillment;
  const fields: { label: string; value: string }[] = [
    { label: "Cliente", value: snapshot.customerName },
    { label: "E-mail", value: snapshot.customerEmail },
    { label: "Documento", value: snapshot.customerDocument ?? "—" },
    { label: "Atração", value: snapshot.attractionName },
    { label: "Categoria", value: snapshot.ticketTypeName },
    { label: "Quantidade", value: String(snapshot.quantity) },
    { label: "Data da visita", value: snapshot.visitDate ?? "Data livre" },
    { label: "Horário", value: snapshot.visitSlot ?? "—" },
  ];

  return (
    <Card className="sticky top-8 h-fit p-6">
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <UserCog className="h-4 w-4" /> Emissão manual · {snapshot.partnerName}
      </div>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink">Pedido {fulfillment.orderId}</h2>
      <p className="text-sm text-ink-subtle">Copie os dados abaixo no portal do agente do parceiro.</p>

      <dl className="mt-5 space-y-2">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center justify-between gap-3 rounded-lg bg-surface-subtle px-3 py-2">
            <div className="min-w-0">
              <dt className="text-xs text-ink-subtle">{field.label}</dt>
              <dd className="truncate text-sm font-medium text-ink">{field.value}</dd>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(field.value)}
              className="shrink-0 text-ink-subtle transition-colors hover:text-brand"
              aria-label={`Copiar ${field.label}`}
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ))}
      </dl>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border py-6 text-sm text-ink-muted">
          <FileUp className="h-4 w-4" /> Anexar bilhetes (PDF)
        </div>
        <Button className="w-full" disabled={fulfillment.status === "ISSUED" || fulfillment.status === "DELIVERED"}>
          Marcar como emitido
        </Button>
        <p className="text-center text-xs text-ink-subtle">
          Ao anexar e emitir, o cliente recebe os bilhetes por e-mail automaticamente.
        </p>
      </div>
    </Card>
  );
}
