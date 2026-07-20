import type { Metadata } from "next";
import { getCurrentSite } from "@/features/tenant/server";
import { listProductsForSite } from "@/lib/repository";
import { ProductCard } from "@/components/catalog/product-card";

export const metadata: Metadata = { title: "Atrações" };

export default async function AtracoesPage() {
  const site = await getCurrentSite();
  const attractions = (await listProductsForSite(site)).filter((p) => p.type === "SIMPLE");

  return (
    <div className="container py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-ink">Atrações</h1>
        <p className="mt-2 text-ink-muted">
          Ingressos individuais para as experiências mais procuradas do Rio.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {attractions.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
