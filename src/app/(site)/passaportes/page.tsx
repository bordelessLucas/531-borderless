import type { Metadata } from "next";
import { getCurrentSite } from "@/features/tenant/server";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { listProductsForSite } from "@/lib/repository";
import { ProductCard } from "@/components/catalog/product-card";
import { BrandIcon } from "@/components/brand/icons";

export const metadata: Metadata = {
  title: ONERIO_VOICE.passports.title,
  description: ONERIO_VOICE.passports.support,
};

export default async function PassaportesPage() {
  const site = await getCurrentSite();
  const passports = (await listProductsForSite(site)).filter(
    (p) => p.type === "PASSPORT",
  );

  return (
    <div className="container py-12">
      <header className="mb-8 max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <BrandIcon id="ticket" size="md" tone="soft" />
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            Acesso combinado
          </span>
        </div>
        <h1 className="heading-section text-4xl">{ONERIO_VOICE.passports.title}</h1>
        <p className="mt-2 text-ink-muted">{ONERIO_VOICE.passports.support}</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {passports.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
