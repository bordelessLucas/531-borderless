import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/features/catalog/types";
import { formatMoney } from "@/features/shared/types";
import { Badge } from "@/components/ui/card";
import { IconTicket } from "@/components/brand/icons";

export function ProductCard({ product }: { product: Product }) {
  const href =
    product.type === "PASSPORT"
      ? `/passaportes/${product.slug}`
      : `/atracoes/${product.slug}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-surface-border/80 bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-float"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-subtle">
        <Image
          src={product.heroImage.url}
          alt={product.heroImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {product.type === "PASSPORT" ? (
          <Badge className="absolute left-4 top-4 gap-1.5 bg-brand text-brand-fg shadow-sm">
            <IconTicket className="h-3.5 w-3.5" />
            Passaporte
          </Badge>
        ) : (
          <Badge className="absolute left-4 top-4 bg-brand-muted text-white shadow-sm">
            Atração
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-muted">
          {product.tagline}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-tight text-ink">
          {product.name}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <p className="text-xs font-medium text-ink-subtle">a partir de</p>
            <p className="mt-0.5 font-display text-xl font-semibold text-ink">
              {formatMoney(product.fromPrice)}
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-subtle text-ink transition-all duration-200 group-hover:bg-brand group-hover:text-brand-fg group-hover:shadow-sm">
            <ArrowUpRight className="h-5 w-5" strokeWidth={2.25} />
          </span>
        </div>
      </div>
    </Link>
  );
}
