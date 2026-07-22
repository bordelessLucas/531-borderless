import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarClock, CalendarDays, Cpu, UserCog } from "lucide-react";
import { getCurrentSite } from "@/features/tenant/server";
import {
  getAttractionById,
  getPartnerById,
  getProductBySlug,
  getTicketTypeById,
} from "@/lib/repository";
import type { AvailabilityMode } from "@/features/attractions/types";
import type { FulfillmentStrategy } from "@/features/partners/types";
import { ContentBlocks } from "@/components/catalog/content-blocks";
import { PassportBookingPanel } from "@/components/booking/passport-booking-panel";
import { BrandIcon, IconTicket } from "@/components/brand/icons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const modeLabel: Record<
  AvailabilityMode,
  { icon: typeof CalendarDays | typeof IconTicket; label: string }
> = {
  SCHEDULED: { icon: CalendarClock, label: "Data e horário marcados" },
  DATED: { icon: CalendarDays, label: "Data livre" },
  OPEN: { icon: IconTicket, label: "Sem data (voucher)" },
};

const strategyLabel: Record<FulfillmentStrategy, { icon: typeof Cpu; label: string }> = {
  API: { icon: Cpu, label: "Emissão automática" },
  MANUAL: { icon: UserCog, label: "Emissão pela equipe" },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getCurrentSite();
  const product = await getProductBySlug(slug, site);
  return { title: product?.name ?? "Passaporte" };
}

export default async function PassaportePage({ params }: PageProps) {
  const { slug } = await params;
  const site = await getCurrentSite();
  const product = await getProductBySlug(slug, site);
  if (!product || product.type !== "PASSPORT" || !product.composition) notFound();

  const items = (
    await Promise.all(
      product.composition.items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(async (item) => {
          const attraction = await getAttractionById(item.attractionId);
          const ticketType = await getTicketTypeById(item.ticketTypeId);
          const partner = attraction ? await getPartnerById(attraction.partnerId) : null;
          const strategy: FulfillmentStrategy =
            ticketType?.strategy ?? partner?.defaultStrategy ?? "MANUAL";
          return { item, attraction, ticketType, strategy };
        }),
    )
  ).filter((x) => x.attraction && x.ticketType);

  return (
    <div>
      <div className="relative h-[380px]">
        <Image src={product.heroImage.url} alt={product.heroImage.alt} fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="container relative flex h-full flex-col justify-end pb-8 text-white">
          <div className="flex items-center gap-3">
            <BrandIcon id="ticket" size="md" tone="soft" className="bg-white/15 text-white" />
            <span className="w-fit rounded-full bg-brand-muted px-3 py-1 text-xs font-semibold text-white">
              Passaporte
            </span>
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{product.name}</h1>
          <p className="mt-1 text-white/80">{product.tagline}</p>
        </div>
      </div>

      <div className="container grid gap-12 py-12 lg:grid-cols-[1fr_380px]">
        <div>
          <ContentBlocks blocks={product.content} />

          <section className="mt-10">
            <h2 className="font-display text-2xl font-semibold text-ink">O que está incluído</h2>
            <p className="mt-1 text-ink-muted">
              {items.length} atrações em um único produto. Cada uma tem suas regras — cuidamos de tudo para você.
            </p>
            <ol className="mt-6 space-y-4">
              {items.map(({ item, attraction, strategy }, index) => {
                const mode = modeLabel[attraction!.availability.mode];
                const strat = strategyLabel[strategy];
                return (
                  <li key={item.id} className="flex gap-4 rounded-2xl border border-surface-border p-5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                      <Image src={attraction!.heroImage.url} alt={attraction!.heroImage.alt} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-fg">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-ink">{attraction!.name}</h3>
                      </div>
                      <p className="mt-1 text-sm text-ink-muted">{attraction!.shortDescription}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-ink-muted">
                          <mode.icon className="h-3.5 w-3.5" /> {mode.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-ink-muted">
                          <strat.icon className="h-3.5 w-3.5" /> {strat.label}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <aside>
          <PassportBookingPanel productSlug={product.slug} unitPrice={product.passportPrice ?? product.fromPrice} />
        </aside>
      </div>
    </div>
  );
}
