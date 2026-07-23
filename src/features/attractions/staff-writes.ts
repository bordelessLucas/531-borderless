"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type {
  AvailabilityPolicy,
  ContentBlock,
  TicketType,
} from "@/features/attractions/types";
import type { Money, PublishStatus } from "@/features/shared/types";
import type { FulfillmentStrategy } from "@/features/partners/types";
import type { PassportComposition, Product } from "@/features/catalog/types";

function newId(col: string): string {
  return doc(collection(getDb(), col)).id;
}

export interface AttractionDraft {
  id?: string;
  partnerId: string;
  name: string;
  slug: string;
  shortDescription: string;
  city: string;
  heroImageUrl: string;
  availability: AvailabilityPolicy;
  content: ContentBlock[];
  highlights: string[];
  usageRules: string[];
  status: PublishStatus;
  featured?: boolean;
  category?: Product["category"];
  metaTitle?: string;
  metaDescription?: string;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

/** Menor preço ativo da atração (centavos) — alimenta o "a partir de" na vitrine. */
async function lowestTicketPriceAmount(attractionId: string): Promise<number> {
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.ticketTypes),
      where("attractionId", "==", attractionId),
    ),
  );
  const prices = snap.docs
    .map((d) => d.data() as TicketType)
    .filter((t) => t.isActive)
    .map((t) => t.price?.amount ?? 0)
    .filter((n) => n > 0);
  return prices.length > 0 ? Math.min(...prices) : 0;
}

async function findSimpleProductId(attractionId: string): Promise<string | null> {
  const snap = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.products),
      where("attractionId", "==", attractionId),
    ),
  );
  const match = snap.docs.find((d) => d.data().type === "SIMPLE");
  return match?.id ?? null;
}

/**
 * Garante Product SIMPLE espelhando a atração — desbloqueia a vitrine.
 * Chamado ao salvar atração e ao alterar ingressos (atualiza fromPrice).
 */
export async function syncSimpleProductForAttraction(opts: {
  attractionId: string;
  name: string;
  slug: string;
  shortDescription: string;
  heroImageUrl: string;
  content: ContentBlock[];
  status: PublishStatus;
  featured?: boolean;
  category?: Product["category"];
  metaTitle?: string;
  metaDescription?: string;
}): Promise<string> {
  const db = getDb();
  const now = new Date().toISOString();
  const fromAmount = await lowestTicketPriceAmount(opts.attractionId);
  const existingId = await findSimpleProductId(opts.attractionId);
  const id = existingId ?? `prod-${opts.attractionId}`;
  const ref = doc(db, COLLECTIONS.products, id);

  const shared = stripUndefined({
    type: "SIMPLE" as const,
    name: opts.name,
    slug: opts.slug,
    tagline: opts.shortDescription.slice(0, 140),
    category: opts.category,
    heroImage: { url: opts.heroImageUrl, alt: opts.name },
    content: opts.content,
    status: opts.status,
    attractionId: opts.attractionId,
    composition: null,
    fromPrice: { amount: fromAmount, currency: "BRL" as const },
    passportPrice: null,
    featured: opts.featured ?? false,
    metaTitle: opts.metaTitle,
    metaDescription: opts.metaDescription,
    updatedAt: now,
  });

  if (existingId) {
    await updateDoc(ref, shared);
  } else {
    await setDoc(ref, { ...shared, createdAt: now });
  }
  return id;
}

export async function saveAttractionDraft(draft: AttractionDraft): Promise<string> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = draft.id ?? newId(COLLECTIONS.attractions);
  const ref = doc(db, COLLECTIONS.attractions, id);
  const heroUrl =
    draft.heroImageUrl.trim() ||
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600";

  const shared = stripUndefined({
    partnerId: draft.partnerId,
    name: draft.name,
    slug: draft.slug,
    shortDescription: draft.shortDescription,
    city: draft.city,
    heroImage: { url: heroUrl, alt: draft.name },
    highlights: draft.highlights,
    usageRules: draft.usageRules,
    content: draft.content,
    availability: draft.availability,
    status: draft.status,
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
    updatedAt: now,
  });

  if (draft.id) {
    await updateDoc(ref, shared);
  } else {
    await setDoc(ref, {
      ...shared,
      gallery: [],
      createdAt: now,
    });
  }

  await syncSimpleProductForAttraction({
    attractionId: id,
    name: draft.name,
    slug: draft.slug,
    shortDescription: draft.shortDescription,
    heroImageUrl: heroUrl,
    content: draft.content,
    status: draft.status,
    featured: draft.featured,
    category: draft.category,
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
  });

  return id;
}

export interface TicketTypeDraft {
  id?: string;
  attractionId: string;
  name: string;
  description?: string;
  priceAmount: number;
  strategy: FulfillmentStrategy | null;
  partnerSkuCode?: string;
  maxPerOrder: number;
  isActive: boolean;
}

export async function saveTicketType(draft: TicketTypeDraft): Promise<string> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = draft.id ?? newId(COLLECTIONS.ticketTypes);
  const price: Money = { amount: draft.priceAmount, currency: "BRL" };

  const body: Omit<TicketType, "id"> = {
    attractionId: draft.attractionId,
    name: draft.name,
    description: draft.description,
    price,
    strategy: draft.strategy,
    partnerSkuCode: draft.partnerSkuCode,
    maxPerOrder: draft.maxPerOrder,
    isActive: draft.isActive,
    createdAt: now,
    updatedAt: now,
  };

  const ref = doc(db, COLLECTIONS.ticketTypes, id);
  if (draft.id) {
    const { createdAt: _c, ...update } = body;
    void _c;
    await updateDoc(ref, { ...update, updatedAt: now });
  } else {
    await setDoc(ref, body);
  }

  const productId = await findSimpleProductId(draft.attractionId);
  if (productId) {
    const fromAmount = await lowestTicketPriceAmount(draft.attractionId);
    await updateDoc(doc(db, COLLECTIONS.products, productId), {
      fromPrice: { amount: fromAmount, currency: "BRL" },
      updatedAt: now,
    });
  }

  return id;
}

export async function deleteTicketType(id: string): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTIONS.ticketTypes, id);
  const before = await getDoc(ref);
  const attractionId = before.data()?.attractionId as string | undefined;
  await deleteDoc(ref);

  if (attractionId) {
    const productId = await findSimpleProductId(attractionId);
    if (productId) {
      const fromAmount = await lowestTicketPriceAmount(attractionId);
      await updateDoc(doc(db, COLLECTIONS.products, productId), {
        fromPrice: { amount: fromAmount, currency: "BRL" },
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

export interface PassportDraft {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  heroImageUrl: string;
  content: ContentBlock[];
  composition: PassportComposition;
  passportPriceAmount: number;
  fromPriceAmount: number;
  status: PublishStatus;
  featured: boolean;
}

export async function savePassportDraft(draft: PassportDraft): Promise<string> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = draft.id ?? newId(COLLECTIONS.products);
  const ref = doc(db, COLLECTIONS.products, id);

  const shared = {
    type: "PASSPORT" as const,
    name: draft.name,
    slug: draft.slug,
    tagline: draft.tagline,
    heroImage: { url: draft.heroImageUrl, alt: draft.name },
    content: draft.content,
    status: draft.status,
    attractionId: null,
    composition: draft.composition,
    fromPrice: { amount: draft.fromPriceAmount, currency: "BRL" as const },
    passportPrice: { amount: draft.passportPriceAmount, currency: "BRL" as const },
    featured: draft.featured,
    updatedAt: now,
  };

  if (draft.id) {
    await updateDoc(ref, shared);
  } else {
    await setDoc(ref, { ...shared, createdAt: now });
  }
  return id;
}
