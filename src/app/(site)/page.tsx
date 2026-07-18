import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import { getCurrentSite } from "@/features/tenant/server";
import { listProductsForSite } from "@/lib/repository";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: CalendarCheck, title: "Datas e horários claros", desc: "Escolha data e horário com disponibilidade em tempo real." },
  { icon: Ticket, title: "Emissão inteligente", desc: "Bilhetes automáticos ou emitidos pela nossa equipe, sem você perceber." },
  { icon: ShieldCheck, title: "Compra segura", desc: "Pagamento protegido e confirmação imediata por e-mail." },
];

export default async function HomePage() {
  const site = await getCurrentSite();
  const products = listProductsForSite(site);
  const passport = products.find((p) => p.type === "PASSPORT");
  const attractions = products.filter((p) => p.type === "SIMPLE");

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        </div>
        <div className="container relative flex min-h-[560px] flex-col justify-end py-16 text-white">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <Sparkles className="h-4 w-4" /> Experiências turísticas no Rio
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            As melhores atrações do Rio em um só lugar.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            Ingressos individuais e passaportes turísticos com curadoria, datas
            flexíveis e uma experiência de compra impecável.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/passaportes"><Button size="lg">Ver passaportes</Button></Link>
            <Link href="/atracoes">
              <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                Explorar atrações
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-surface-border bg-surface-subtle">
        <div className="container grid gap-6 py-10 md:grid-cols-3">
          {perks.map((perk) => (
            <div key={perk.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <perk.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-ink">{perk.title}</p>
                <p className="text-sm text-ink-muted">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {passport ? (
        <section className="container py-16">
          <div className="relative overflow-hidden rounded-3xl border border-surface-border">
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[280px]">
                <Image src={passport.heroImage.url} alt={passport.heroImage.alt} fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-center gap-4 bg-brand p-10 text-brand-fg">
                <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium">Passaporte em destaque</span>
                <h2 className="font-display text-3xl font-semibold">{passport.name}</h2>
                <p className="text-brand-fg/80">{passport.tagline}</p>
                <Link href={`/passaportes/${passport.slug}`} className="mt-2">
                  <Button variant="secondary" size="lg">Conhecer passaporte</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="container pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink">Atrações em destaque</h2>
            <p className="mt-1 text-ink-muted">Escolha sua experiência e compre em poucos cliques.</p>
          </div>
          <Link href="/atracoes" className="hidden text-sm font-medium text-brand hover:underline md:block">
            Ver todas
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
