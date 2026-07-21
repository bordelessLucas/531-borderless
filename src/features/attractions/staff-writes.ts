"use client";

import {
  collection,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
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
import type { PassportComposition } from "@/features/catalog/types";

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
  metaTitle?: string;
  metaDescription?: string;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

export async function saveAttractionDraft(draft: AttractionDraft): Promise<string> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = draft.id ?? newId(COLLECTIONS.attractions);
  const ref = doc(db, COLLECTIONS.attractions, id);

  const shared = stripUndefined({
    partnerId: draft.partnerId,
    name: draft.name,
    slug: draft.slug,
    shortDescription: draft.shortDescription,
    city: draft.city,
    heroImage: { url: draft.heroImageUrl, alt: draft.name },
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
  return id;
}

export async function deleteTicketType(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.ticketTypes, id));
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
