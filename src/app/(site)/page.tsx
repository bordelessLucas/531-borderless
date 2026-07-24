import { Mail, Phone } from "lucide-react";
import { getCurrentSite } from "@/features/tenant/server";
import { listProductsForSite } from "@/lib/repository";
import { HomeHero } from "@/components/home/home-hero";
import { AttractionsCarousel } from "@/components/home/attractions-carousel";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" className={className} fill="currentColor" aria-hidden>
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

export default async function HomePage() {
  const site = await getCurrentSite();
  const products = await listProductsForSite(site);
  const attractions = products.filter((p) => p.type === "SIMPLE");
  const phone = site.supportPhone ?? "(21) 97613-7463";
  const email = site.contactEmail || "contato@oneriopass.com";
  const waDigits = phone.replace(/\D/g, "");
  const waHref = `https://wa.me/55${waDigits}?text=${encodeURIComponent("Olá, vim através do site da OneRio")}`;

  return (
    <>
      <HomeHero />

      {/* NO RIO AGORA — carrossel de atrações */}
      <section id="ingressos" className="py-12 md:py-20">
        <div className="container">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-muted">
            No Rio agora
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-brand md:text-4xl">
            Escolha o seu próximo passeio
          </h2>
          <div className="mt-8">
            <AttractionsCarousel products={attractions} />
          </div>
        </div>
      </section>

      {/* Contato / parceiros — card creme sobre marinho */}
      <section className="bg-brand py-12 md:py-14">
        <div className="container">
          <div className="grid items-center gap-8 rounded-[18px] bg-brand-fg px-6 py-10 md:grid-cols-[1fr_auto] md:px-12 md:py-12">
            <div>
              <h2 className="font-display text-xl font-semibold uppercase text-brand md:text-2xl">
                Você administra alguma atração?
              </h2>
              <p className="mt-2 text-base text-brand">
                Gostaria de incluí-la na <strong>OneRio</strong>? Nos envie uma
                mensagem.
              </p>
              <h3 className="mt-8 font-display text-lg font-semibold uppercase text-brand">
                Nossos contatos
              </h3>
              <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-brand">
                <li className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  {email}
                </li>
                <li className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  {phone}
                </li>
              </ul>
            </div>
            <div>
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-8 py-5 text-base font-semibold text-brand-fg transition-colors hover:bg-brand-muted"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Entrar em Contato
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
