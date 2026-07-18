"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { formatMoney, money, type Money } from "@/features/shared/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PassportBookingPanelProps {
  productSlug: string;
  unitPrice: Money;
}

export function PassportBookingPanel({ productSlug, unitPrice }: PassportBookingPanelProps) {
  const [qty, setQty] = useState(1);
  const router = useRouter();
  const total = qty * unitPrice.amount;

  const goToCheckout = () => {
    const params = new URLSearchParams({ product: productSlug, passport: String(qty) });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <Card className="sticky top-24 p-6">
      <p className="text-xs text-ink-subtle">Passaporte por pessoa</p>
      <p className="font-display text-3xl font-semibold text-ink">{formatMoney(unitPrice)}</p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">Quantidade</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border text-ink-muted hover:border-brand"
            aria-label="Diminuir"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-5 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(10, q + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border text-ink-muted hover:border-brand"
            aria-label="Aumentar"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 border-t border-surface-border pt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">Total</span>
          <span className="font-display text-2xl font-semibold text-ink">{formatMoney(money(total))}</span>
        </div>
        <Button className="mt-4 w-full" size="lg" onClick={goToCheckout}>
          Continuar para o pagamento
        </Button>
        <p className="mt-3 text-center text-xs text-ink-subtle">
          Você agenda as datas de cada atração após a compra.
        </p>
      </div>
    </Card>
  );
}
