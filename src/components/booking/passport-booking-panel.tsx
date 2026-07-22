"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, money, type Money } from "@/features/shared/types";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

interface PassportBookingPanelProps {
  productSlug: string;
  unitPrice: Money;
}

export function PassportBookingPanel({
  productSlug,
  unitPrice,
}: PassportBookingPanelProps) {
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const total = qty * unitPrice.amount;

  const goToCheckout = () => {
    const params = new URLSearchParams({
      product: productSlug,
      passport: String(qty),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <Card className="sticky top-24 p-7 shadow-float md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-subtle">
        Passaporte por pessoa
      </p>
      <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
        {formatMoney(unitPrice)}
      </p>

      <div className="mt-7 flex items-center justify-between gap-4 rounded-2xl border border-surface-border/70 bg-surface-subtle/50 px-4 py-3.5">
        <span className="text-[15px] font-semibold text-ink">Quantidade</span>
        <QuantityStepper value={qty} min={1} max={10} onChange={setQty} />
      </div>

      <div className="mt-7 border-t border-surface-border pt-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-muted">Total</span>
          <span className="font-display text-3xl font-semibold tracking-tight text-ink">
            {formatMoney(money(total))}
          </span>
        </div>
        <Button className="mt-5 w-full" size="lg" onClick={goToCheckout}>
          {ONERIO_VOICE.cta.goToCheckout}
        </Button>
        <p className="mt-4 text-center text-sm leading-relaxed text-ink-subtle">
          Você agenda as datas de cada atração após confirmar o pedido.
        </p>
      </div>
    </Card>
  );
}
