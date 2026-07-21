"use client";

import { useRef, useState } from "react";
import { Copy, FileUp, Loader2, UserCog } from "lucide-react";
import type { Fulfillment, FulfillmentStatus } from "@/features/fulfillment/types";
import {
  markFulfillmentIssued,
  uploadTicketPdf,
} from "@/features/fulfillment/issue";
import { useAuth } from "@/features/auth/auth-provider";
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

export function FulfillmentQueue({ items: initial }: { items: Fulfillment[] }) {
  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const selected = items.find((f) => f.id === selectedId) ?? null;

  function patchItem(id: string, patch: Partial<Fulfillment>) {
    setItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <Card className="divide-y divide-surface-border">
        {items.map((f) => {
          const s = statusStyle[f.status];
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedId(f.id)}
              className={cn(
                "flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors",
                selected?.id === f.id ? "bg-surface-subtle" : "hover:bg-surface-subtle",
              )}
            >
              <div>
                <p className="text-sm font-medium text-ink">{f.snapshot.attractionName}</p>
                <p className="text-xs text-ink-subtle">
                  {f.snapshot.customerName} · pedido {f.orderId.slice(0, 8)} · {f.snapshot.quantity}x{" "}
                  {f.snapshot.ticketTypeName}
                </p>
              </div>
              <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium", s.className)}>
                {s.label}
              </span>
            </button>
          );
        })}
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-subtle">Fila vazia.</p>
        ) : null}
      </Card>

      {selected ? (
        <FulfillmentDetail
          fulfillment={selected}
          onUpdated={(patch) => patchItem(selected.id, patch)}
        />
      ) : null}
    </div>
  );
}

function FulfillmentDetail({
  fulfillment,
  onUpdated,
}: {
  fulfillment: Fulfillment;
  onUpdated: (patch: Partial<Fulfillment>) => void;
}) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { snapshot } = fulfillment;
  const done = fulfillment.status === "ISSUED" || fulfillment.status === "DELIVERED";

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

  async function onFile(file: File | undefined) {
    if (!file || !user) return;
    setBusy(true);
    setError(null);
    try {
      const { asset } = await uploadTicketPdf({
        orderId: fulfillment.orderId,
        fulfillmentId: fulfillment.id,
        file,
        handledByUid: user.uid,
      });
      onUpdated({
        status: "ISSUED",
        ticketAssets: [asset],
        handledByUid: user.uid,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onMarkIssued() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await markFulfillmentIssued({
        fulfillmentId: fulfillment.id,
        handledByUid: user.uid,
      });
      onUpdated({ status: "ISSUED", handledByUid: user.uid });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao marcar como emitido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="sticky top-8 h-fit p-6">
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <UserCog className="h-4 w-4" /> Emissão manual · {snapshot.partnerName}
      </div>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink">
        Pedido {fulfillment.orderId.slice(0, 8)}
      </h2>
      <p className="text-sm text-ink-subtle">Copie os dados abaixo no portal do agente do parceiro.</p>

      <dl className="mt-5 space-y-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="flex items-center justify-between gap-3 rounded-lg bg-surface-subtle px-3 py-2"
          >
            <div className="min-w-0">
              <dt className="text-xs text-ink-subtle">{field.label}</dt>
              <dd className="truncate text-sm font-medium text-ink">{field.value}</dd>
            </div>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(field.value)}
              className="shrink-0 text-ink-subtle transition-colors hover:text-brand"
              aria-label={`Copiar ${field.label}`}
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ))}
      </dl>

      {fulfillment.ticketAssets[0] ? (
        <a
          href={fulfillment.ticketAssets[0].url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block truncate text-sm text-brand hover:underline"
        >
          Bilhete: {fulfillment.ticketAssets[0].fileName}
        </a>
      ) : null}

      <div className="mt-6 space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={done || busy}
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border py-6 text-sm text-ink-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
          {done ? "Bilhete anexado" : "Anexar bilhetes (PDF)"}
        </button>
        <Button className="w-full" disabled={done || busy} onClick={() => void onMarkIssued()}>
          {busy ? "Salvando…" : "Marcar como emitido"}
        </Button>
        {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}
        <p className="text-center text-xs text-ink-subtle">
          Ao anexar e emitir, o bilhete fica disponível na área do cliente.
        </p>
      </div>
    </Card>
  );
}
