import type { ID, PublishStatus, Timestamps } from "@/features/shared/types";

/**
 * Site (tenant) da arquitetura multi-site / whitelabel.
 *
 * A OneRio é apenas mais um `Site` (o principal). Cada parceiro pode ter seu
 * próprio domínio, tema e recorte de catálogo, tudo servido pelo mesmo código.
 */
export interface SiteTheme {
  /** Cores em "R G B" (ex.: "0 8 95" = Noite Fresca) para CSS variables. */
  brand: string;
  brandFg: string;
  brandMuted: string;
  logoUrl: string;
  faviconUrl?: string;
}

export interface Site extends Timestamps {
  id: ID;
  /** slug interno, também usado como subdomínio de fallback (ex.: onerio). */
  slug: string;
  name: string;
  /** Domínios que resolvem para este site (ex.: onerio.com, ingressos.parceiro.com). */
  domains: string[];
  theme: SiteTheme;
  /**
   * Recorte de catálogo. `null` = mostra tudo (site principal OneRio).
   * Um site de parceiro normalmente lista só as atrações daquele partner.
   */
  attractionIds: ID[] | null;
  partnerId: ID | null;
  status: PublishStatus;
  contactEmail: string;
  supportPhone?: string;
}
