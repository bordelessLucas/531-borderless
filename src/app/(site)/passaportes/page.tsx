import type { Metadata } from "next";
import { getCurrentSite } from "@/features/tenant/server";
import { listProductsForSite } from "@/lib/repository";
import { ProductCard } from "@/components/catalog/product-card";

export const metadata: Metadata = { title: "Passaportes" };

export default async function PassaportesPage() {
  const site = await getCurrentSite();
  const passports = (await listProductsForSite(site)).filter((p) => p.type === "PASSPORT");

  return (
    <div className="container py-12">
      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl font-semibold text-ink">Passaportes turísticos</h1>
        <p className="mt-2 text-ink-muted">
          Combine várias atrações em um único produto — uma compra, uma experiência.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {passports.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
