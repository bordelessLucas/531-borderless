import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentSite } from "@/features/tenant/server";
import {
  getProductBySlug,
  getTicketTypeById,
} from "@/lib/repository";
import { money } from "@/features/shared/types";
import { CheckoutForm, type CheckoutLine } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const site = await getCurrentSite();
  const productSlug = typeof sp.product === "string" ? sp.product : "";
  const product = productSlug ? await getProductBySlug(productSlug, site) : null;

  const visitDate = typeof sp.date === "string" && sp.date ? sp.date : null;
  const visitSlot = typeof sp.slot === "string" && sp.slot ? sp.slot : null;

  const lines: CheckoutLine[] = [];

  if (product?.type === "PASSPORT") {
    const qty = Number(sp.passport ?? 1) || 1;
    lines.push({
      label: product.name,
      detail: "Passaporte — agendamento após a compra",
      quantity: qty,
      unitPrice: product.passportPrice ?? product.fromPrice,
    });
  } else if (product?.type === "SIMPLE") {
    const detail = [visitDate, visitSlot].filter(Boolean).join(" · ") || "Data livre";
    for (const entry of asArray(sp.tt)) {
      const [id, qtyRaw] = entry.split(":");
      const ticketType = id ? await getTicketTypeById(id) : null;
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

  const total = money(lines.reduce((s, l) => s + l.quantity * l.unitPrice.amount, 0));

  if (!product || lines.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Seu carrinho está vazio</h1>
        <p className="mt-2 text-ink-muted">Escolha uma atração ou passaporte para continuar.</p>
        <Link href="/" className="mt-6 inline-block text-brand hover:underline">Voltar à página inicial</Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink">Finalizar compra</h1>
      <CheckoutForm
        lines={lines}
        total={total}
        siteId={site.id}
        product={product}
        visitDate={visitDate}
        visitSlot={visitSlot}
      />
    </div>
  );
}
