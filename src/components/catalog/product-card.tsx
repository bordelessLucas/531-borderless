import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/features/catalog/types";
import { formatMoney } from "@/features/shared/types";
import { resolveProductImage } from "@/lib/onerio-assets";

export function ProductCard({ product }: { product: Product }) {
  const href =
    product.type === "PASSPORT"
      ? `/passaportes/${product.slug}`
      : `/atracoes/${product.slug}`;
  const image = resolveProductImage(product.slug, product.heroImage);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-card ring-1 ring-surface-border/60">
      <Link href={href} className="relative block aspect-[3/2] overflow-hidden bg-surface-subtle">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
        <h3 className="font-display text-lg font-semibold leading-snug text-brand md:text-[22px]">
          <Link href={href} className="hover:text-brand-muted">
            {product.name}
          </Link>
        </h3>
        {product.tagline ? (
          <p className="line-clamp-2 text-sm text-ink-muted">{product.tagline}</p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm text-brand">
            a partir de{" "}
            <span className="font-semibold">{formatMoney(product.fromPrice)}</span>
          </p>
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-[15px] font-semibold text-brand-fg transition-colors hover:bg-brand-muted"
          >
            Ver Opções
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}
