"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import type { AvailabilityPolicy, TicketType } from "@/features/attractions/types";
import { formatMoney, money } from "@/features/shared/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BookingPanelProps {
  productSlug: string;
  ticketTypes: TicketType[];
  availability: AvailabilityPolicy;
}

function nextDates(days: number): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = [];
  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }),
    });
  }
  return out;
}

export function BookingPanel({ productSlug, ticketTypes, availability }: BookingPanelProps) {
  const dates = useMemo(() => nextDates(10), []);
  const [date, setDate] = useState<string>(availability.mode === "OPEN" ? "" : dates[0]!.iso);
  const [slot, setSlot] = useState<string>(availability.defaultSlots[0]?.start ?? "");
  const [qty, setQty] = useState<Record<string, number>>({});

  const setQuantity = (id: string, delta: number, max: number) =>
    setQty((prev) => {
      const next = Math.min(Math.max((prev[id] ?? 0) + delta, 0), max);
      return { ...prev, [id]: next };
    });

  const total = ticketTypes.reduce(
    (sum, tt) => sum + (qty[tt.id] ?? 0) * tt.price.amount,
    0,
  );
  const totalQty = Object.values(qty).reduce((a, b) => a + b, 0);
  const router = useRouter();

  const canCheckout =
    totalQty > 0 &&
    (availability.mode === "OPEN" || date !== "") &&
    (availability.mode !== "SCHEDULED" || slot !== "");

  const goToCheckout = () => {
    const params = new URLSearchParams({ product: productSlug, date, slot });
    for (const [id, q] of Object.entries(qty)) if (q > 0) params.append("tt", `${id}:${q}`);
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <Card className="sticky top-24 p-6">
      {availability.mode !== "OPEN" ? (
        <div>
          <p className="text-sm font-semibold text-ink">Escolha a data</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {dates.map((d) => (
              <button
                key={d.iso}
                onClick={() => setDate(d.iso)}
                className={cn(
                  "shrink-0 rounded-xl border px-3 py-2 text-center text-xs capitalize transition-colors",
                  date === d.iso
                    ? "border-brand bg-brand text-brand-fg"
                    : "border-surface-border text-ink-muted hover:border-brand",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-surface-subtle px-4 py-3 text-sm text-ink-muted">
          Voucher com data livre — válido por {availability.validityDays ?? 90} dias.
        </p>
      )}

      {availability.mode === "SCHEDULED" && availability.defaultSlots.length > 0 ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-ink">Horário</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {availability.defaultSlots.map((s) => (
              <button
                key={s.start}
                onClick={() => setSlot(s.start)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  slot === s.start
                    ? "border-brand bg-brand text-brand-fg"
                    : "border-surface-border text-ink-muted hover:border-brand",
                )}
              >
                {s.start}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <p className="text-sm font-semibold text-ink">Ingressos</p>
        {ticketTypes.map((tt) => (
          <div key={tt.id} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">{tt.name}</p>
              <p className="text-sm text-ink-muted">{formatMoney(tt.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(tt.id, -1, tt.maxPerOrder)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border text-ink-muted transition-colors hover:border-brand disabled:opacity-40"
                disabled={(qty[tt.id] ?? 0) === 0}
                aria-label={`Remover ${tt.name}`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-5 text-center text-sm font-medium">{qty[tt.id] ?? 0}</span>
              <button
                onClick={() => setQuantity(tt.id, 1, tt.maxPerOrder)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border text-ink-muted transition-colors hover:border-brand"
                aria-label={`Adicionar ${tt.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-surface-border pt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">Total</span>
          <span className="font-display text-2xl font-semibold text-ink">
            {formatMoney(money(total))}
          </span>
        </div>
        <Button className="mt-4 w-full" size="lg" disabled={!canCheckout} onClick={goToCheckout}>
          Continuar para o pagamento
        </Button>
      </div>
    </Card>
  );
}
