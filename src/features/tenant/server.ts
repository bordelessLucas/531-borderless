import "server-only";
import { headers } from "next/headers";
import { getSiteByHost } from "@/lib/repository";
import type { Site } from "@/features/tenant/types";

/**
 * Resolve o site (tenant) a partir do Host da requisição.
 * Em export estático (Hosting Spark), usa o site default — sem headers().
 */
export async function getCurrentSite(): Promise<Site> {
  if (process.env.STATIC_EXPORT === "1") {
    return await getSiteByHost(null);
  }
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  return await getSiteByHost(host);
}

/** CSS variables inline para aplicar o tema do tenant no <html>. */
export function siteThemeVars(site: Site): Record<string, string> {
  return {
    "--brand": site.theme.brand,
    "--brand-fg": site.theme.brandFg,
    "--brand-muted": site.theme.brandMuted,
  };
}
