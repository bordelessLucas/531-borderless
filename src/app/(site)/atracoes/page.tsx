import type { Metadata } from "next";
import { getCurrentSite } from "@/features/tenant/server";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { listProductsForSite } from "@/lib/repository";
import { ProductCard } from "@/components/catalog/product-card";
import type { Product } from "@/features/catalog/types";
import {
  ATTRACTION_CATEGORY_ORDER,
  PRODUCT_CATEGORY_LABELS,
} from "@/features/catalog/categories";

export const metadata: Metadata = {
  title: ONERIO_VOICE.attractions.title,
  description: ONERIO_VOICE.attractions.support,
};

function groupByCategory(products: Product[]) {
  const groups: { id: string; label: string; items: Product[] }[] = [];

  for (const key of ATTRACTION_CATEGORY_ORDER) {
    const items = products.filter((p) => p.category === key);
    if (items.length > 0) {
      groups.push({ id: key, label: PRODUCT_CATEGORY_LABELS[key], items });
    }
  }

  const known = new Set<string>(ATTRACTION_CATEGORY_ORDER);
  const uncategorized = products.filter((p) => !p.category || !known.has(p.category));
  if (uncategorized.length > 0) {
    groups.push({ id: "outras", label: "Outras atrações", items: uncategorized });
  }

  return groups;
}

export default async function AtracoesPage() {
  const site = await getCurrentSite();
  const attractions = (await listProductsForSite(site)).filter(
    (p) => p.type === "SIMPLE",
  );
  const groups = groupByCategory(attractions);

  return (
    <div className="bg-surface">
      <div className="bg-brand-muted py-10 md:py-14">
        <div className="container text-center">
          <h1 className="heading-display text-3xl text-brand-fg md:text-5xl">
            TODAS AS ATRAÇÕES
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-brand-fg/90">
            {ONERIO_VOICE.attractions.support}
          </p>
        </div>
      </div>

      <div className="container space-y-14 py-12 md:py-16">
        {groups.map((group) => (
          <section key={group.id}>
            <h2 className="heading-display text-center text-2xl text-brand md:text-left md:text-3xl">
              {group.label}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
