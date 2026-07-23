import Image from "next/image";
import { cn } from "@/lib/utils";
interface BrandMarkProps {
  name: string;
  logoUrl?: string;
  /** Mantido por compatibilidade; logo do site já funciona em fundo Noite Fresca. */
  inverted?: boolean;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Marca OneRio: usa logoUrl do site quando houver; senão wordmark em Chillax.
 */
export function BrandMark({
  name,
  logoUrl,
  inverted = false,
  className,
  size = "md",
}: BrandMarkProps) {
  if (logoUrl) {
    return (
      <span className={cn("relative inline-flex items-center", className)}>
        <Image
          src={logoUrl}
          alt={name}
          width={size === "sm" ? 140 : 168}
          height={size === "sm" ? 45 : 54}
          className="h-8 w-auto object-contain md:h-9"
          unoptimized
          priority
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandIcon inverted={inverted} size={size} />
      <span
        className={cn(
          "font-display font-semibold tracking-tight",
          size === "sm" ? "text-lg" : "text-[1.35rem] leading-none",
          inverted ? "text-brand-fg" : "text-brand",
        )}
      >
        {name}
      </span>
    </span>
  );
}

/** Ícone geométrico provisório (mapa/módulo) — substituir pelo ícone oficial. */
function BrandIcon({
  inverted,
  size,
}: {
  inverted: boolean;
  size: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl",
        dim,
        inverted ? "bg-brand-fg/15 text-brand-fg" : "bg-brand text-brand-fg",
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="currentColor">
        <path d="M7 3h4v4H7V3zm6 0h4v4h-4V3zM7 9h4v4H7V9zm6 0h4v6h-4V9zM7 15h4v6H7v-6zm6 4h4v2h-4v-2z" />
      </svg>
    </span>
  );
}
