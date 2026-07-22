"use client";

import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { FulfillmentStrategy, PartnerIntegration } from "@/features/partners/types";

function newId(col: string): string {
  return doc(collection(getDb(), col)).id;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

export interface PartnerDraft {
  id?: string;
  name: string;
  slug: string;
  defaultStrategy: FulfillmentStrategy;
  integration: PartnerIntegration | null;
  /** Comissão OneRio em basis points (1000 = 10%). */
  commissionBps: number;
  contactEmail: string;
  isActive: boolean;
}

export async function savePartner(draft: PartnerDraft): Promise<string> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = draft.id ?? newId(COLLECTIONS.partners);
  const ref = doc(db, COLLECTIONS.partners, id);

  const shared = stripUndefined({
    name: draft.name,
    slug: draft.slug,
    defaultStrategy: draft.defaultStrategy,
    integration: draft.integration,
    commissionBps: draft.commissionBps,
    contactEmail: draft.contactEmail,
    isActive: draft.isActive,
    updatedAt: now,
  });

  if (draft.id) {
    await updateDoc(ref, shared);
  } else {
    await setDoc(ref, { ...shared, createdAt: now });
  }

  return id;
}
