import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/features/catalog/types";
import { formatMoney } from "@/features/shared/types";
import { Badge } from "@/components/ui/card";

export function ProductCard({ product }: { product: Product }) {
  const href =
    product.type === "PASSPORT"
      ? `/passaportes/${product.slug}`
      : `/atracoes/${product.slug}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-card transition-all hover:-translate-y-1 hover:shadow-float"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.heroImage.url}
          alt={product.heroImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.type === "PASSPORT" ? (
          <Badge className="absolute left-4 top-4 bg-brand text-brand-fg">Passaporte</Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
          {product.tagline}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-xs text-ink-subtle">a partir de</p>
            <p className="text-lg font-semibold text-ink">{formatMoney(product.fromPrice)}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-subtle text-ink transition-colors group-hover:bg-brand group-hover:text-brand-fg">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
