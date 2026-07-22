import "server-only";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type Firestore,
  type QueryConstraint,
} from "firebase/firestore";
import type { Site } from "@/features/tenant/types";
import type { Partner } from "@/features/partners/types";
import type { Attraction, TicketType } from "@/features/attractions/types";
import type { Product } from "@/features/catalog/types";
import type { Fulfillment } from "@/features/fulfillment/types";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

/**
 * Camada de acesso a dados via Firestore (Client SDK no servidor).
 * Catálogo é leitura pública nas rules — não exige Auth nem Cloud Functions.
 * Fulfillments sensíveis exigem staff; sem Auth/Admin caem em lista vazia.
 */

const DEFAULT_SITE = process.env.NEXT_PUBLIC_DEFAULT_SITE ?? "onerio";

function db(): Firestore {
  return getDb();
}

function asEntity<T extends { id: string }>(
  id: string,
  data: Record<string, unknown> | undefined,
): T | null {
  if (!data) return null;
  return { id, ...data } as T;
}

async function getById<T extends { id: string }>(
  collectionName: string,
  id: string,
): Promise<T | null> {
  const snap = await getDoc(doc(db(), collectionName, id));
  if (!snap.exists()) return null;
  return asEntity<T>(snap.id, snap.data() as Record<string, unknown>);
}

async function listAll<T extends { id: string }>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const q =
    constraints.length > 0
      ? query(collection(db(), collectionName), ...constraints)
      : collection(db(), collectionName);
  const snap = await getDocs(q);
  return snap.docs.map((d) => asEntity<T>(d.id, d.data() as Record<string, unknown>)!);
}

export async function getSiteByHost(host: string | null): Promise<Site> {
  const clean = (host ?? "").split(":")[0]?.toLowerCase() ?? "";

  if (clean) {
    const byDomain = await listAll<Site>(
      COLLECTIONS.sites,
      where("domains", "array-contains", clean),
    );
    if (byDomain[0]) return byDomain[0];
  }

  const bySlug = await listAll<Site>(
    COLLECTIONS.sites,
    where("slug", "==", DEFAULT_SITE),
  );
  if (bySlug[0]) return bySlug[0];

  const all = await listSites();
  if (!all[0]) {
    throw new Error(
      "Nenhum site no Firestore. Rode `npm run seed` após conectar o projeto.",
    );
  }
  return all[0];
}

export async function listSites(): Promise<Site[]> {
  return listAll<Site>(COLLECTIONS.sites);
}

export async function getSiteById(id: string): Promise<Site | null> {
  return getById<Site>(COLLECTIONS.sites, id);
}

export async function listPartners(): Promise<Partner[]> {
  return listAll<Partner>(COLLECTIONS.partners);
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  return getById<Partner>(COLLECTIONS.partners, id);
}

export async function listAttractions(): Promise<Attraction[]> {
  return listAll<Attraction>(
    COLLECTIONS.attractions,
    where("status", "==", "PUBLISHED"),
  );
}

export async function getAttractionById(id: string): Promise<Attraction | null> {
  return getById<Attraction>(COLLECTIONS.attractions, id);
}

export async function getAttractionBySlug(slug: string): Promise<Attraction | null> {
  const rows = await listAll<Attraction>(
    COLLECTIONS.attractions,
    where("slug", "==", slug),
  );
  return rows[0] ?? null;
}

export async function getTicketTypesByAttraction(
  attractionId: string,
): Promise<TicketType[]> {
  const rows = await listTicketTypesByAttractionAdmin(attractionId);
  return rows.filter((t) => t.isActive);
}

/** Admin: inclui categorias inativas. */
export async function listTicketTypesByAttractionAdmin(
  attractionId: string,
): Promise<TicketType[]> {
  return listAll<TicketType>(
    COLLECTIONS.ticketTypes,
    where("attractionId", "==", attractionId),
  );
}

export async function listAllAttractions(): Promise<Attraction[]> {
  return listAll<Attraction>(COLLECTIONS.attractions);
}

export async function listAllTicketTypes(): Promise<TicketType[]> {
  return listAll<TicketType>(COLLECTIONS.ticketTypes);
}

export async function getTicketTypeById(id: string): Promise<TicketType | null> {
  return getById<TicketType>(COLLECTIONS.ticketTypes, id);
}

/** Produtos visíveis no site (respeita o recorte multi-tenant). */
export async function listProductsForSite(site: Site): Promise<Product[]> {
  const published = await listAll<Product>(
    COLLECTIONS.products,
    where("status", "==", "PUBLISHED"),
  );
  if (site.attractionIds === null) return published;
  const allowed = new Set(site.attractionIds);
  return published.filter((p) => {
    if (p.type === "SIMPLE") return p.attractionId && allowed.has(p.attractionId);
    return p.composition?.items.some((i) => allowed.has(i.attractionId)) ?? false;
  });
}

export async function getProductBySlug(
  slug: string,
  site: Site,
): Promise<Product | null> {
  const rows = await listAll<Product>(COLLECTIONS.products, where("slug", "==", slug));
  const product = rows.find((p) => p.status === "PUBLISHED");
  if (!product) return null;
  const visible = (await listProductsForSite(site)).some((p) => p.id === product.id);
  return visible ? product : null;
}

export async function listAllProducts(): Promise<Product[]> {
  return listAll<Product>(COLLECTIONS.products);
}

/** Fila de emissão manual (backoffice). Ordena pendentes primeiro. */
export async function listManualFulfillments(): Promise<Fulfillment[]> {
  const rank: Record<string, number> = {
    PENDING: 0,
    PROCESSING: 1,
    FAILED: 2,
    ISSUED: 3,
    DELIVERED: 4,
    CANCELLED: 5,
  };

  try {
    const rows = await listAll<Fulfillment>(
      COLLECTIONS.fulfillments,
      where("strategy", "==", "MANUAL"),
    );
    return rows
      .slice()
      .sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9));
  } catch {
    // Rules exigem staff; sem Auth/service account a fila fica vazia (plano Spark, sem Functions).
    return [];
  }
}
