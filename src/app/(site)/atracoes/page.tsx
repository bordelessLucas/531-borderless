import type { Metadata } from "next";
import { getCurrentSite } from "@/features/tenant/server";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { listProductsForSite } from "@/lib/repository";
import { ProductCard } from "@/components/catalog/product-card";

export const metadata: Metadata = {
  title: ONERIO_VOICE.attractions.title,
  description: ONERIO_VOICE.attractions.support,
};

export default async function AtracoesPage() {
  const site = await getCurrentSite();
  const attractions = (await listProductsForSite(site)).filter(
    (p) => p.type === "SIMPLE",
  );

  return (
    <div className="container py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="heading-section text-4xl">{ONERIO_VOICE.attractions.title}</h1>
        <p className="mt-2 text-ink-muted">{ONERIO_VOICE.attractions.support}</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {attractions.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
