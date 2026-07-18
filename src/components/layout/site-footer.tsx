import Link from "next/link";
import type { Site } from "@/features/tenant/types";

export function SiteFooter({ site }: { site: Site }) {
  return (
    <footer className="border-t border-surface-border bg-surface-subtle">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-lg font-semibold text-ink">{site.name}</p>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            Ingressos, experiências e passaportes turísticos com curadoria e uma
            experiência de compra impecável.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Explorar</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/atracoes" className="hover:text-ink">Atrações</Link></li>
            <li><Link href="/passaportes" className="hover:text-ink">Passaportes</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Contato</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>{site.contactEmail}</li>
            {site.supportPhone ? <li>{site.supportPhone}</li> : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-surface-border py-4">
        <p className="container text-xs text-ink-subtle">
          © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
