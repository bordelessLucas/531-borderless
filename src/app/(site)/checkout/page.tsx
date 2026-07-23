import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentSite } from "@/features/tenant/server";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { listAllTicketTypes, listProductsForSite } from "@/lib/repository";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const metadata: Metadata = {
  title: ONERIO_VOICE.checkout.title,
  description: ONERIO_VOICE.promise,
};

export default async function CheckoutPage() {
  const site = await getCurrentSite();
  const [products, ticketTypes] = await Promise.all([
    listProductsForSite(site),
    listAllTicketTypes(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center text-ink-muted">Carregando checkout…</div>
      }
    >
      <CheckoutClient siteId={site.id} products={products} ticketTypes={ticketTypes} />
    </Suspense>
  );
}
