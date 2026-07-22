"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  labelDecrease?: string;
  labelIncrease?: string;
  className?: string;
}

/** Controle de quantidade com alvo de toque confortável (storefront). */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  labelDecrease = "Diminuir",
  labelIncrease = "Aumentar",
  className,
}: QuantityStepperProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={labelDecrease}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full border border-surface-border bg-surface text-ink",
          "transition-all duration-150 hover:border-brand hover:bg-brand/5",
          "disabled:pointer-events-none disabled:opacity-35",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        )}
      >
        <Minus className="h-4 w-4" strokeWidth={2.25} />
      </button>
      <span className="min-w-[1.75rem] text-center text-base font-semibold tabular-nums text-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={labelIncrease}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full border border-surface-border bg-surface text-ink",
          "transition-all duration-150 hover:border-brand hover:bg-brand/5",
          "disabled:pointer-events-none disabled:opacity-35",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2.25} />
      </button>
    </div>
  );
}
