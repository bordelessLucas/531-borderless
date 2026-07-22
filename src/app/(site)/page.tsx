import Image from "next/image";
import Link from "next/link";
import { getCurrentSite } from "@/features/tenant/server";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { listProductsForSite } from "@/lib/repository";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { BrandIcon, type BrandIconId } from "@/components/brand/icons";

/** Perks da home → ícones oficiais do brand book (contexto de visita). */
const perkIcons: BrandIconId[] = ["aviao", "ticket", "camera"];

export default async function HomePage() {
  const site = await getCurrentSite();
  const products = await listProductsForSite(site);
  const passport = products.find((p) => p.type === "PASSPORT" && p.featured);
  const attractions = products
    .filter((p) => p.type === "SIMPLE" && p.featured)
    .slice(0, 6);
  const copy = ONERIO_VOICE;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=1920"
            alt="Rio de Janeiro"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand/95 via-brand/55 to-black/25" />
        </div>
        <div className="container relative flex min-h-[560px] flex-col justify-end py-16 text-brand-fg">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-muted px-4 py-1.5 text-sm font-medium text-white">
            {copy.home.eyebrow}
          </span>
          <h1 className="heading-display mt-5 max-w-2xl text-4xl text-brand-fg md:text-6xl">
            {copy.home.headline}
          </h1>
          <p className="mt-4 max-w-xl text-lg font-light text-brand-fg/80">
            {copy.home.support}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/passaportes">
              <Button size="lg" variant="secondary">
                {copy.cta.explorePassports}
              </Button>
            </Link>
            <Link href="/atracoes">
              <Button
                size="lg"
                variant="outline"
                className="border-brand-fg/40 bg-brand-fg/10 text-brand-fg hover:bg-brand-fg/20"
              >
                {copy.cta.exploreAttractions}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-border bg-surface">
        <div className="container grid gap-8 py-12 md:grid-cols-3 md:gap-10">
          {copy.home.perks.map((perk, index) => (
            <div key={perk.title} className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <BrandIcon id={perkIcons[index] ?? "ticket"} size="lg" tone="ui" />
              <div className="min-w-0">
                <p className="font-display text-base font-semibold tracking-tight text-ink">
                  {perk.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {passport ? (
        <section className="container py-16">
          <div className="relative overflow-hidden rounded-3xl border border-surface-border shadow-card">
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[280px]">
                <Image
                  src={passport.heroImage.url}
                  alt={passport.heroImage.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center gap-4 bg-brand p-10 text-brand-fg">
                <div className="flex items-center gap-3">
                  <BrandIcon id="ticket" size="md" tone="soft" className="bg-brand-fg/15 text-brand-fg" />
                  <span className="w-fit rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-white">
                    {copy.home.featuredPassportLabel}
                  </span>
                </div>
                <h2 className="heading-display text-3xl text-brand-fg">{passport.name}</h2>
                <p className="text-brand-fg/80">{passport.tagline}</p>
                <Link href={`/passaportes/${passport.slug}`} className="mt-2">
                  <Button variant="secondary" size="lg">
                    {copy.home.featuredPassportCta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="container pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="heading-section text-3xl">{copy.home.attractionsTitle}</h2>
            <p className="mt-1 text-ink-muted">{copy.home.attractionsSupport}</p>
          </div>
          <Link
            href="/atracoes"
            className="hidden text-sm font-medium text-brand-muted hover:underline md:block"
          >
            {copy.home.attractionsLink}
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {attractions.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
