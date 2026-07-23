"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AvailabilityPolicy, TicketType } from "@/features/attractions/types";
import {
  listAvailableDays,
  slotsForDate,
} from "@/features/attractions/availability";
import { formatMoney, money } from "@/features/shared/types";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { cn } from "@/lib/utils";

interface BookingPanelProps {
  productSlug: string;
  ticketTypes: TicketType[];
  availability: AvailabilityPolicy;
}

export function BookingPanel({
  productSlug,
  ticketTypes,
  availability,
}: BookingPanelProps) {
  const dates = useMemo(() => listAvailableDays(availability, 14), [availability]);
  const [date, setDate] = useState<string>(
    availability.mode === "OPEN" ? "" : dates[0]?.iso ?? "",
  );
  const slots = useMemo(
    () => (date ? slotsForDate(availability, date) : availability.defaultSlots),
    [availability, date],
  );
  const [slot, setSlot] = useState<string>(slots[0]?.start ?? "");
  const [qty, setQty] = useState<Record<string, number>>({});

  const setQuantity = (id: string, next: number, max: number) =>
    setQty((prev) => ({ ...prev, [id]: Math.min(Math.max(next, 0), max) }));

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
    <Card className="sticky top-24 border-surface-border bg-surface p-7 shadow-float md:p-8">
      {availability.mode !== "OPEN" ? (
        <div>
          <p className="text-sm font-semibold text-ink">Escolha a data</p>
          {dates.length === 0 ? (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3.5 text-sm text-amber-800">
              Nenhuma data disponível no momento (calendário/lead time).
            </p>
          ) : (
            <div className="scrollbar-brand mt-4 flex gap-2.5 overflow-x-auto pb-2">
              {dates.map((d) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => {
                    setDate(d.iso);
                    const nextSlots = slotsForDate(availability, d.iso);
                    setSlot(nextSlots[0]?.start ?? "");
                  }}
                  className={cn(
                    "min-w-[4.5rem] shrink-0 rounded-2xl border px-3.5 py-3 text-center text-sm capitalize transition-all duration-150",
                    date === d.iso
                      ? "border-brand bg-brand text-brand-fg shadow-sm"
                      : "border-surface-border bg-surface-subtle text-ink-muted hover:border-brand/40 hover:text-ink",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface-subtle px-4 py-3.5 text-sm leading-relaxed text-ink-muted">
          Voucher com data livre — válido por {availability.validityDays ?? 90} dias.
        </p>
      )}

      {availability.mode === "SCHEDULED" && slots.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-ink">Horário</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {slots.map((s) => (
              <button
                key={s.start}
                type="button"
                onClick={() => setSlot(s.start)}
                className={cn(
                  "min-h-11 rounded-xl border px-4 text-[15px] font-medium transition-all duration-150",
                  slot === s.start
                    ? "border-brand bg-brand text-brand-fg shadow-sm"
                    : "border-surface-border text-ink-muted hover:border-brand/40 hover:text-ink",
                )}
              >
                {s.start}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-7 space-y-5">
        <p className="text-sm font-semibold text-ink">Ingressos</p>
        {ticketTypes.map((tt) => (
          <div
            key={tt.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-surface-border/70 bg-surface-subtle px-4 py-3.5"
          >
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink">{tt.name}</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                {formatMoney(tt.price)}
              </p>
            </div>
            <QuantityStepper
              value={qty[tt.id] ?? 0}
              min={0}
              max={tt.maxPerOrder}
              onChange={(next) => setQuantity(tt.id, next, tt.maxPerOrder)}
              labelDecrease={`Remover ${tt.name}`}
              labelIncrease={`Adicionar ${tt.name}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-7 border-t border-surface-border pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-muted">Total</span>
          <span className="font-display text-3xl font-semibold tracking-tight text-ink">
            {formatMoney(money(total))}
          </span>
        </div>
        <Button
          className="mt-5 w-full"
          size="lg"
          disabled={!canCheckout}
          onClick={goToCheckout}
        >
          {ONERIO_VOICE.cta.goToCheckout}
        </Button>
      </div>
    </Card>
  );
}
