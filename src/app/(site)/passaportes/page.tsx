import type { Metadata } from "next";
import { getCurrentSite } from "@/features/tenant/server";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { listProductsForSite } from "@/lib/repository";
import { ProductCard } from "@/components/catalog/product-card";

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
    <div className="bg-surface">
      <div className="bg-brand py-10 md:py-14">
        <div className="container text-center">
          <h1 className="heading-display text-3xl text-brand-fg md:text-5xl">
            PASSAPORTES
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-brand-fg/90">
            {ONERIO_VOICE.passports.support}
          </p>
        </div>
      </div>
      <div className="container grid gap-6 py-12 sm:grid-cols-2 md:py-16 lg:grid-cols-3">
        {passports.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
