import { cn } from "@/lib/utils";
import { ONERIO_BRAND } from "@/features/tenant/brand";

export type BrandIconId =
  | "aviao"
  | "notas"
  | "rock"
  | "ticket"
  | "camera"
  | "chinelo";

/**
 * Pairings do brand book — usar em tiles grandes / empty states.
 * Em chips e perks, preferir `tone="ui"` (mais legível).
 */
export const BRAND_ICON_PAIRINGS: Record<
  BrandIconId,
  { bg: string; fg: string; label: string; tagline: string }
> = {
  aviao: {
    bg: ONERIO_BRAND.noiteFrescaHex,
    fg: ONERIO_BRAND.rotaQuenteHex,
    label: "Avião",
    tagline: "Sonhos & Começos",
  },
  notas: {
    bg: ONERIO_BRAND.luzDoDiaHex,
    fg: ONERIO_BRAND.noiteFrescaHex,
    label: "Notas Musicais",
    tagline: "Cultura e Musicalidade",
  },
  rock: {
    bg: ONERIO_BRAND.rotaQuenteHex,
    fg: ONERIO_BRAND.luzDoDiaHex,
    label: "Rock'n'Roll",
    tagline: "Jovialidade e Disrupção",
  },
  ticket: {
    bg: ONERIO_BRAND.trilhaAbertaHex,
    fg: ONERIO_BRAND.rosaDeRuaHex,
    label: "Ticket",
    tagline: "Participação & Acesso",
  },
  camera: {
    bg: ONERIO_BRAND.rosaDeRuaHex,
    fg: ONERIO_BRAND.luzDoDiaHex,
    label: "Câmera",
    tagline: "Engajamento & Memória",
  },
  chinelo: {
    bg: ONERIO_BRAND.soloNativoHex,
    fg: ONERIO_BRAND.trilhaAbertaHex,
    label: "Chinelo",
    tagline: "Conforto & Liberdade",
  },
};

interface IconSvgProps {
  className?: string;
}

/** Glyphs flat, viewBox preenchido (~80%) para legibilidade em 40–56px. */
export function IconAviao({ className }: IconSvgProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden>
      <path d="M22.5 3h3c1.1 0 2 .9 2 2v8.2l14.2 5.8c1.4.6 2 2.2 1.4 3.5-.4.8-1.1 1.3-2 1.4L27.5 25v6.8l5.8 4c1 .7 1.2 2.1.4 3-.5.6-1.2.8-1.9.7l-6.3-1.4-6.3 1.4c-.7.1-1.4-.1-1.9-.7-.8-.9-.6-2.3.4-3l5.8-4V25L6.9 23.9c-.9-.1-1.6-.6-2-1.4-.6-1.3 0-2.9 1.4-3.5L20.5 13.2V5c0-1.1.9-2 2-2z" />
    </svg>
  );
}

export function IconNotas({ className }: IconSvgProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden>
      <path d="M38 5.5c.9-.2 1.7.5 1.7 1.4v24.2c0 4-3 7.5-7 8-4.5.6-8.2-2.9-8.2-7.4 0-3.7 2.7-6.8 6.2-7.4.7-.1 1.4 0 2 .3V16.5L14.5 20v17.2c0 4-3 7.5-7 8-4.5.6-8.2-2.9-8.2-7.4 0-3.7 2.7-6.8 6.2-7.4.7-.1 1.4 0 2 .3V17.2c0-1.2.8-2.3 1.9-2.6L38 5.5z" />
    </svg>
  );
}

export function IconRock({ className }: IconSvgProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden>
      <path d="M14.8 4c1.5 0 2.7 1.2 2.7 2.7v14.5h2V8.2c0-1.5 1.2-2.7 2.7-2.7s2.7 1.2 2.7 2.7v12.8h2V6.5c0-1.5 1.2-2.7 2.7-2.7s2.7 1.2 2.7 2.7v21.2l3.8-3.8c1.1-1.1 3-1.1 4.1 0 1.1 1.1 1.1 2.9 0 4.1L32.5 41c-1.9 2.4-4.8 3.8-7.9 3.8h-4.5c-4.2 0-7.9-2.7-9.2-6.7L7.2 24.8c-.6-1.8.4-3.7 2.2-4.3.5-.2 1.1-.2 1.5 0V6.7C10.9 5.2 12.1 4 13.6 4h1.2z" />
    </svg>
  );
}

export function IconTicket({ className }: IconSvgProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden>
      <path d="M7 12.5A4.5 4.5 0 0 1 11.5 8h25A4.5 4.5 0 0 1 41 12.5v5.2a5.5 5.5 0 0 0 0 10.6v5.2a4.5 4.5 0 0 1-4.5 4.5h-25A4.5 4.5 0 0 1 7 33.5v-5.2a5.5 5.5 0 0 0 0-10.6v-5.2zM26 15h-4v3h4v-3zm0 7h-4v3h4v-3zm0 7h-4v3h4v-3z" />
    </svg>
  );
}

export function IconCamera({ className }: IconSvgProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden>
      <path d="M16.5 8h3.2l1.5-2.2A2.5 2.5 0 0 1 23.2 4.5h5.6a2.5 2.5 0 0 1 2 1.3L32.3 8h3.2A6.5 6.5 0 0 1 42 14.5v19A6.5 6.5 0 0 1 35.5 40h-23A6.5 6.5 0 0 1 6 33.5v-19A6.5 6.5 0 0 1 12.5 8h4zM24 17a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
    </svg>
  );
}

export function IconChinelo({ className }: IconSvgProps) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden>
      <path d="M15.2 5.5c3.2 0 5.6 1.9 6.3 4.8.3 1.1-.1 2.2-.8 3L15.2 21c-.5.7-.6 1.6-.3 2.4.8 2.6 1.2 5.2 1.2 7.8 0 5-3.1 8.5-7.1 8.5S2 36.2 2 31.2c0-2.6.4-5.2 1.2-7.8.3-.8.2-1.7-.3-2.4L1.3 17c-.8-1.2-.3-2.9 1.1-3.7 2.4-1.4 5.8-2.6 9.6-6.8h3.2zm17.6 0c3.8 4.2 7.2 5.4 9.6 6.8 1.4.8 1.9 2.5 1.1 3.7l-1.6 2.4c-.5.7-.6 1.6-.3 2.4.8 2.6 1.2 5.2 1.2 7.8 0 5-3.1 8.5-7.1 8.5s-7.1-3.5-7.1-8.5c0-2.6.4-5.2 1.2-7.8.3-.8.2-1.7-.3-2.4L27.1 13.3c-.7-.8-1.1-1.9-.8-3 0.7-2.9 3.1-4.8 6.3-4.8h.2z" />
      <path d="M15 11.2c2 0 3.6 2.3 3.6 5.1v2.2c0 .6-.7.9-1.1.5l-2.8-2.4a1.2 1.2 0 0 1-.5-1V12.4c0-.7.4-1.2.8-1.2zm18 0c.4 0 .8.5.8 1.2v2.6c0 .4-.2.8-.5 1l-2.8 2.4c-.4.4-1.1.1-1.1-.5v-2.2c0-2.8 1.6-5.1 3.6-5.1z" />
    </svg>
  );
}

const ICON_MAP = {
  aviao: IconAviao,
  notas: IconNotas,
  rock: IconRock,
  ticket: IconTicket,
  camera: IconCamera,
  chinelo: IconChinelo,
} as const;

export type BrandIconTone = "ui" | "soft" | "paired" | "plain";

interface BrandIconProps {
  id: BrandIconId;
  className?: string;
  /**
   * - `ui` (padrão): Noite Fresca + Luz do Dia — legível em perks/headers
   * - `soft`: fundo sutil + ícone brand
   * - `paired`: cores oficiais do brand book (tiles / empty states)
   * - `plain`: só o glyph (currentColor)
   */
  tone?: BrandIconTone;
  /** @deprecated use tone="paired" */
  paired?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const tileClass = {
  sm: "h-10 w-10 rounded-xl",
  md: "h-12 w-12 rounded-2xl",
  lg: "h-16 w-16 rounded-2xl",
  xl: "h-20 w-20 rounded-3xl",
} as const;

/** Glyph ~62% do tile — proporção de marca, sem “ponto perdido” no centro. */
const glyphClass = {
  sm: "h-[1.35rem] w-[1.35rem]",
  md: "h-[1.65rem] w-[1.65rem]",
  lg: "h-[2.15rem] w-[2.15rem]",
  xl: "h-11 w-11",
} as const;

/**
 * Ícone OneRio para UI. Default `tone="ui"` evita contraste vibrante em chips.
 */
export function BrandIcon({
  id,
  className,
  tone,
  paired,
  size = "md",
}: BrandIconProps) {
  const Icon = ICON_MAP[id];
  const pairing = BRAND_ICON_PAIRINGS[id];
  const resolved: BrandIconTone =
    tone ?? (paired === true ? "paired" : paired === false ? "plain" : "ui");

  if (resolved === "plain") {
    return <Icon className={cn(glyphClass[size], className)} />;
  }

  if (resolved === "paired") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          tileClass[size],
          className,
        )}
        style={{ backgroundColor: pairing.bg, color: pairing.fg }}
        aria-hidden
      >
        <Icon className={glyphClass[size]} />
      </span>
    );
  }

  if (resolved === "soft") {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-brand/8 text-brand",
          tileClass[size],
          className,
        )}
        aria-hidden
      >
        <Icon className={glyphClass[size]} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-brand text-brand-fg",
        tileClass[size],
        className,
      )}
      aria-hidden
    >
      <Icon className={glyphClass[size]} />
    </span>
  );
}
