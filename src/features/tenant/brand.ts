/**
 * Tokens oficiais OneRio (Material de Marca).
 * Cores em "R G B" para CSS variables / SiteTheme.
 */
export const ONERIO_BRAND = {
  /** Noite Fresca — confiança e modernidade (primária). */
  noiteFresca: "0 8 95",
  noiteFrescaHex: "#00085F",
  /** Rota Quente — descoberta e alegria (destaque / CTA secundário). */
  rotaQuente: "255 93 6",
  rotaQuenteHex: "#FF5D06",
  /** Luz do Dia — serenidade (fundo / texto sobre brand). */
  luzDoDia: "251 255 225",
  luzDoDiaHex: "#FBFFE1",
  /** Solo Nativo — encantamento (texto / terra). */
  soloNativo: "43 15 13",
  soloNativoHex: "#2B0F0D",
  /** Rosa de Rua — vivacidade. */
  rosaDeRua: "245 28 82",
  rosaDeRuaHex: "#F51C52",
  /** Trilha Aberta — ação e energia. */
  trilhaAberta: "43 235 4",
  trilhaAbertaHex: "#2BEB04",
} as const;

/** Wordmark oficial do site (header/footer em fundo Noite Fresca). */
export const ONERIO_LOGO_URL = "/brand/onerio-logo-site.png";
/** Wordmark claro legado — mesmo asset do site (já pensado para fundo escuro). */
export const ONERIO_LOGO_LIGHT_URL = "/brand/onerio-logo-site.png";
/** Símbolo / marca quadrada (footer). */
export const ONERIO_LOGO_MARK_URL = "/brand/onerio-logo-mark.png";

/** Tema default do site principal OneRio. */
export const ONERIO_SITE_THEME = {
  brand: ONERIO_BRAND.noiteFresca,
  brandFg: ONERIO_BRAND.luzDoDia,
  brandMuted: ONERIO_BRAND.rotaQuente,
  logoUrl: ONERIO_LOGO_URL,
} as const;

/** Resolve a logo do tenant; site principal cai no wordmark oficial. */
export function resolveSiteLogoUrl(site: {
  slug: string;
  theme: { logoUrl: string };
}): string | undefined {
  if (site.slug === "onerio") return ONERIO_LOGO_URL;
  if (site.theme.logoUrl) return site.theme.logoUrl;
  return undefined;
}
