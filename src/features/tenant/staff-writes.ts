"use client";

import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { SiteTheme } from "@/features/tenant/types";
import type { PublishStatus } from "@/features/shared/types";

function newId(col: string): string {
  return doc(collection(getDb(), col)).id;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

export interface SiteDraft {
  id?: string;
  name: string;
  slug: string;
  domains: string[];
  theme: SiteTheme;
  /** `null` = catálogo completo (site principal). */
  attractionIds: string[] | null;
  partnerId: string | null;
  status: PublishStatus;
  contactEmail: string;
  supportPhone?: string;
}

export async function saveSite(draft: SiteDraft): Promise<string> {
  const db = getDb();
  const now = new Date().toISOString();
  const id = draft.id ?? newId(COLLECTIONS.sites);
  const ref = doc(db, COLLECTIONS.sites, id);

  const theme: SiteTheme = {
    brand: draft.theme.brand,
    brandFg: draft.theme.brandFg,
    brandMuted: draft.theme.brandMuted,
    logoUrl: draft.theme.logoUrl,
    ...(draft.theme.faviconUrl ? { faviconUrl: draft.theme.faviconUrl } : {}),
  };

  const shared = stripUndefined({
    name: draft.name,
    slug: draft.slug,
    domains: draft.domains,
    theme,
    attractionIds: draft.attractionIds,
    partnerId: draft.partnerId,
    status: draft.status,
    contactEmail: draft.contactEmail,
    supportPhone: draft.supportPhone || undefined,
    updatedAt: now,
  });

  if (draft.id) {
    await updateDoc(ref, shared);
  } else {
    await setDoc(ref, { ...shared, createdAt: now });
  }

  return id;
}
