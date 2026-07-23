import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Info, MapPin } from "lucide-react";
import { getCurrentSite } from "@/features/tenant/server";
import {
  getAttractionById,
  getProductBySlug,
  getTicketTypesByAttraction,
} from "@/lib/repository";
import { ContentBlocks } from "@/components/catalog/content-blocks";
import { BookingPanel } from "@/components/booking/booking-panel";
import { Badge } from "@/components/ui/card";
import { BrandIcon } from "@/components/brand/icons";
import { resolveProductImage } from "@/lib/onerio-assets";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { listAllProducts } = await import("@/lib/repository");
  const products = await listAllProducts();
  return products
    .filter((p) => p.type === "SIMPLE" && p.status === "PUBLISHED")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getCurrentSite();
  const product = await getProductBySlug(slug, site);
  return { title: product?.name ?? "Atração" };
}

export default async function AtracaoPage({ params }: PageProps) {
  const { slug } = await params;
  const site = await getCurrentSite();
  const product = await getProductBySlug(slug, site);
  if (!product || product.type !== "SIMPLE" || !product.attractionId) notFound();

  const attraction = await getAttractionById(product.attractionId);
  if (!attraction) notFound();
  const ticketTypes = await getTicketTypesByAttraction(attraction.id);
  const hero = resolveProductImage(product.slug, attraction.heroImage);

  return (
    <div>
      <div className="relative h-[380px]">
        <Image src={hero.url} alt={hero.alt} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="container relative flex h-full flex-col justify-end pb-8 text-white">
          <div className="mb-2 flex items-center gap-3">
            <BrandIcon id="camera" size="md" tone="soft" className="bg-white/15 text-white" />
            <span className="rounded-full bg-brand-muted px-3 py-1 text-xs font-semibold text-white">
              Atração
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {attraction.highlights.map((h) => (
              <Badge key={h} className="bg-white/15 text-white backdrop-blur">{h}</Badge>
            ))}
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{attraction.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-white/80">
            <MapPin className="h-4 w-4" /> {attraction.city}
          </p>
        </div>
      </div>

      <div className="container grid gap-12 py-12 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-lg leading-relaxed text-ink-muted">{attraction.shortDescription}</p>
          <div className="mt-8"><ContentBlocks blocks={attraction.content} /></div>

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-ink">Destaques</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {attraction.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-ink-muted">
                  <CheckCircle2 className="h-5 w-5 text-brand-muted" /> {h}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 rounded-2xl bg-surface-subtle p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
              <Info className="h-5 w-5 text-brand-muted" /> Regras de uso
            </h2>
            <ul className="mt-4 space-y-2">
              {attraction.usageRules.map((r) => (
                <li key={r} className="flex gap-3 text-sm text-ink-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-subtle" /> {r}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside>
          <BookingPanel
            productSlug={product.slug}
            ticketTypes={ticketTypes}
            availability={attraction.availability}
          />
        </aside>
      </div>
    </div>
  );
}
