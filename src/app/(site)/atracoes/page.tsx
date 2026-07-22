import type { Metadata } from "next";
import { getCurrentSite } from "@/features/tenant/server";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { listProductsForSite } from "@/lib/repository";
import { ProductCard } from "@/components/catalog/product-card";
import { BrandIcon } from "@/components/brand/icons";
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
    <div className="container py-12">
      <header className="mb-10 max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <BrandIcon id="camera" size="md" tone="soft" />
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            Experiências
          </span>
        </div>
        <h1 className="heading-section text-4xl">{ONERIO_VOICE.attractions.title}</h1>
        <p className="mt-2 text-ink-muted">{ONERIO_VOICE.attractions.support}</p>
      </header>

      <div className="space-y-14">
        {groups.map((group) => (
          <section key={group.id}>
            <h2 className="heading-section text-2xl">{group.label}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
