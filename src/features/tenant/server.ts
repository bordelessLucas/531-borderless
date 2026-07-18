import "server-only";
import { headers } from "next/headers";
import { getSiteByHost } from "@/lib/repository";
import type { Site } from "@/features/tenant/types";

/**
 * Resolve o site (tenant) a partir do Host da requisição.
 * Base da arquitetura multi-site / whitelabel: o mesmo código serve OneRio e
 * qualquer site de parceiro, mudando apenas o recorte de catálogo e o tema.
 */
export async function getCurrentSite(): Promise<Site> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  return getSiteByHost(host);
}

/** CSS variables inline para aplicar o tema do tenant no <html>. */
export function siteThemeVars(site: Site): Record<string, string> {
  return {
    "--brand": site.theme.brand,
    "--brand-fg": site.theme.brandFg,
    "--brand-muted": site.theme.brandMuted,
  };
}
