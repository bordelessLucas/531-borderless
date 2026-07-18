import Link from "next/link";
import { MapPin, Ticket } from "lucide-react";
import type { Site } from "@/features/tenant/types";
import { Button } from "@/components/ui/button";

export function SiteHeader({ site }: { site: Site }) {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-fg">
            <Ticket className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
          <Link href="/atracoes" className="transition-colors hover:text-ink">Atrações</Link>
          <Link href="/passaportes" className="transition-colors hover:text-ink">Passaportes</Link>
          <span className="flex items-center gap-1 text-ink-subtle">
            <MapPin className="h-4 w-4" /> Rio de Janeiro
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/passaportes">
            <Button size="sm">Explorar passaportes</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
