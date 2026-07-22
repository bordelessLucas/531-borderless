import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-brand-fg shadow-sm hover:bg-brand/90 hover:shadow-md active:scale-[0.98] focus-visible:ring-brand",
  secondary:
    "bg-brand-muted text-white shadow-sm hover:bg-brand-muted/90 hover:shadow-md active:scale-[0.98] focus-visible:ring-brand-muted",
  outline:
    "border border-surface-border bg-surface text-ink shadow-sm hover:border-brand/30 hover:bg-surface-subtle active:scale-[0.98] focus-visible:ring-brand",
  ghost:
    "text-ink-muted hover:bg-surface-subtle hover:text-ink focus-visible:ring-brand",
};

const sizes: Record<Size, string> = {
  sm: "h-10 min-h-10 px-4 text-sm",
  md: "h-12 min-h-12 px-6 text-[15px]",
  lg: "h-14 min-h-14 px-8 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-full font-semibold tracking-tight",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
