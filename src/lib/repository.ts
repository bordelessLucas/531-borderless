import type { Site } from "@/features/tenant/types";
import type { Partner } from "@/features/partners/types";
import type { Attraction, TicketType } from "@/features/attractions/types";
import type { Product } from "@/features/catalog/types";
import type { Fulfillment } from "@/features/fulfillment/types";
import {
  seedAttractions,
  seedFulfillments,
  seedPartners,
  seedProducts,
  seedSites,
  seedTicketTypes,
} from "@/lib/seed/data";

/**
 * Camada de acesso a dados. Hoje serve o seed (protótipo roda sem backend).
 * A troca para Firestore acontece só aqui: as páginas não mudam.
 *
 * TODO(firebase): substituir os `seed*` por queries via getDb()/getAdminDb()
 * quando o projeto/emulador estiver conectado.
 */

const DEFAULT_SITE = process.env.NEXT_PUBLIC_DEFAULT_SITE ?? "onerio";

export function getSiteByHost(host: string | null): Site {
  const clean = (host ?? "").split(":")[0]?.toLowerCase() ?? "";
  const byDomain = seedSites.find((s) => s.domains.includes(clean));
  if (byDomain) return byDomain;
  return seedSites.find((s) => s.slug === DEFAULT_SITE) ?? seedSites[0]!;
}

export function listSites(): Site[] {
  return seedSites;
}

export function listPartners(): Partner[] {
  return seedPartners;
}

export function getPartnerById(id: string): Partner | null {
  return seedPartners.find((p) => p.id === id) ?? null;
}

export function listAttractions(): Attraction[] {
  return seedAttractions.filter((a) => a.status === "PUBLISHED");
}

export function getAttractionById(id: string): Attraction | null {
  return seedAttractions.find((a) => a.id === id) ?? null;
}

export function getAttractionBySlug(slug: string): Attraction | null {
  return seedAttractions.find((a) => a.slug === slug) ?? null;
}

export function getTicketTypesByAttraction(attractionId: string): TicketType[] {
  return seedTicketTypes.filter((t) => t.attractionId === attractionId && t.isActive);
}

export function getTicketTypeById(id: string): TicketType | null {
  return seedTicketTypes.find((t) => t.id === id) ?? null;
}

/** Produtos visíveis no site (respeita o recorte multi-tenant). */
export function listProductsForSite(site: Site): Product[] {
  const published = seedProducts.filter((p) => p.status === "PUBLISHED");
  if (site.attractionIds === null) return published;
  const allowed = new Set(site.attractionIds);
  return published.filter((p) => {
    if (p.type === "SIMPLE") return p.attractionId && allowed.has(p.attractionId);
    return p.composition?.items.some((i) => allowed.has(i.attractionId)) ?? false;
  });
}

export function getProductBySlug(slug: string, site: Site): Product | null {
  const product = seedProducts.find((p) => p.slug === slug && p.status === "PUBLISHED");
  if (!product) return null;
  const visible = listProductsForSite(site).some((p) => p.id === product.id);
  return visible ? product : null;
}

export function listAllProducts(): Product[] {
  return seedProducts;
}

/** Fila de emissão manual (backoffice). Ordena pendentes primeiro. */
export function listManualFulfillments(): Fulfillment[] {
  const rank: Record<string, number> = { PENDING: 0, PROCESSING: 1, FAILED: 2, ISSUED: 3, DELIVERED: 4, CANCELLED: 5 };
  return seedFulfillments
    .filter((f) => f.strategy === "MANUAL")
    .slice()
    .sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9));
}
