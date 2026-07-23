"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/features/catalog/types";
import type { TicketType } from "@/features/attractions/types";
import { money, type Money } from "@/features/shared/types";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { CheckoutForm, type CheckoutLine } from "@/components/checkout/checkout-form";
import { BrandIcon } from "@/components/brand/icons";
import { Button } from "@/components/ui/button";

function asArray(value: string | null): string[] {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

interface CheckoutClientProps {
  siteId: string;
  products: Product[];
  ticketTypes: TicketType[];
}

/**
 * Checkout compatível com export estático: lê query string no client.
 * Em SSR normal a page server ainda pode pré-montar linhas; este client
 * cobre o Hosting Spark (sem Cloud Functions).
 */
export function CheckoutClient({ siteId, products, ticketTypes }: CheckoutClientProps) {
  const sp = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const { product, lines, visitDate, visitSlot, total } = useMemo(() => {
    const productSlug = sp.get("product") ?? "";
    const product = products.find((p) => p.slug === productSlug) ?? null;
    const visitDate = sp.get("date") || null;
    const visitSlot = sp.get("slot") || null;
    const lines: CheckoutLine[] = [];

    if (product?.type === "PASSPORT") {
      const qty = Number(sp.get("passport") ?? 1) || 1;
      lines.push({
        label: product.name,
        detail: "Passaporte — datas das atrações após a confirmação",
        quantity: qty,
        unitPrice: product.passportPrice ?? product.fromPrice,
      });
    } else if (product?.type === "SIMPLE") {
      const detail = [visitDate, visitSlot].filter(Boolean).join(" · ") || "Data livre";
      // URL pode vir como tt=id:qty&tt=id:qty ou tt=id:qty,id:qty
      const rawTt = sp.getAll("tt").length > 0 ? sp.getAll("tt") : asArray(sp.get("tt"));
      for (const entry of rawTt) {
        const [id, qtyRaw] = entry.split(":");
        const ticketType = ticketTypes.find((t) => t.id === id);
        const quantity = Number(qtyRaw) || 0;
        if (ticketType && quantity > 0) {
          lines.push({
            label: ticketType.name,
            detail,
            quantity,
            unitPrice: ticketType.price,
            ticketTypeId: ticketType.id,
          });
        }
      }
    }

    const total: Money = money(
      lines.reduce((s, l) => s + l.quantity * l.unitPrice.amount, 0),
    );
    return { product, lines, visitDate, visitSlot, total };
  }, [sp, products, ticketTypes]);

  if (!ready) {
    return (
      <div className="container py-20 text-center text-ink-muted">Carregando checkout…</div>
    );
  }

  if (!product || lines.length === 0) {
    return (
      <div className="container py-20 text-center">
        <BrandIcon id="ticket" size="xl" tone="soft" className="mx-auto" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
          {ONERIO_VOICE.checkout.emptyTitle}
        </h1>
        <p className="mt-2 text-ink-muted">{ONERIO_VOICE.checkout.emptySupport}</p>
        <Link href="/atracoes" className="mt-6 inline-block">
          <Button variant="secondary">{ONERIO_VOICE.cta.exploreAttractions}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">
        {ONERIO_VOICE.checkout.title}
      </h1>
      <CheckoutForm
        lines={lines}
        total={total}
        siteId={siteId}
        product={product}
        visitDate={visitDate}
        visitSlot={visitSlot}
      />
    </div>
  );
}
