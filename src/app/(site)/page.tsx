import Image from "next/image";
import Link from "next/link";
import { getCurrentSite } from "@/features/tenant/server";
import { listProductsForSite } from "@/lib/repository";
import { ProductCard } from "@/components/catalog/product-card";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ONERIO_PARTNERS, ONERIO_TRUST } from "@/lib/onerio-assets";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const site = await getCurrentSite();
  const products = await listProductsForSite(site);
  const featured = products
    .filter((p) => p.type === "SIMPLE" && p.featured)
    .slice(0, 3);
  const allAttractions = products.filter((p) => p.type === "SIMPLE");
  const phone = site.supportPhone ?? "(21) 97613-7463";
  const email = site.contactEmail || "contato@oneriopass.com";
  const waDigits = phone.replace(/\D/g, "");

  return (
    <>
      <HeroCarousel />

      {/* Atrações em destaque — fundo Rota Quente */}
      <section id="destaques" className="bg-brand-muted py-12 md:py-20">
        <div className="container">
          <h2 className="heading-display text-center text-2xl text-brand-fg md:text-4xl">
            ATRAÇÕES EM DESTAQUE
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Todas as atrações — fundo Luz do Dia */}
      <section id="ingressos" className="relative bg-surface py-12 md:py-16">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-10 overflow-hidden text-brand-muted"
          aria-hidden
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              fill="currentColor"
              d="M761.9,44.1L643.1,27.2L333.8,98L0,3.8V0l1000,0v3.9"
            />
          </svg>
        </div>
        <div className="container pt-6">
          <h2 className="heading-display text-center text-2xl text-brand md:text-4xl">
            TODAS AS ATRAÇÕES
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allAttractions.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/atracoes">
              <Button size="lg" variant="primary">
                Ver catálogo completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Parcerias */}
      <section className="bg-brand py-12 md:py-16">
        <div className="container">
          <div className="rounded-[18px] bg-surface px-6 py-10 md:px-12 md:py-14">
            <h2 className="heading-display text-center text-2xl text-brand md:text-4xl">
              NOSSAS PARCERIAS
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center font-sans text-base text-ink-muted md:text-lg">
              Confira abaixo as atrações turísticas e operadoras parceiras da
              OneRio e garanta seus ingressos!
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {ONERIO_PARTNERS.map((partner) => (
                <Image
                  key={partner.src}
                  src={partner.src}
                  alt={partner.alt}
                  width={117}
                  height={117}
                  className="h-14 w-auto object-contain md:h-16"
                  unoptimized
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-surface py-12 md:py-16">
        <div className="container grid gap-8 md:grid-cols-2">
          {ONERIO_TRUST.map((item) => (
            <div key={item.title} className="flex gap-5 rounded-2xl bg-white/70 p-5 md:p-6">
              <Image
                src={item.image}
                alt=""
                width={174}
                height={174}
                className="h-16 w-16 shrink-0 object-contain md:h-20 md:w-20"
                unoptimized
              />
              <div>
                <h3 className="heading-display text-lg text-brand md:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted md:text-base">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA parceiros / contato */}
      <section className="bg-brand py-12 text-brand-fg md:py-16">
        <div className="container grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="heading-display text-2xl md:text-3xl">
              VOCÊ ADMINISTRA ALGUMA ATRAÇÃO?
            </h2>
            <p className="mt-3 text-brand-fg/85">
              Gostaria de incluí-la na <strong>OneRio</strong>? Nos envie uma
              mensagem.
            </p>
            <h3 className="mt-8 font-display text-xl font-semibold uppercase">
              Nossos contatos
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-brand-fg/85">
              <li>{email}</li>
              <li>{phone}</li>
            </ul>
          </div>
          <div className="md:text-right">
            <a
              href={`https://wa.me/55${waDigits}?text=${encodeURIComponent("Olá, vim através do site da OneRio")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-muted px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-muted/90"
            >
              Entrar em Contato
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
