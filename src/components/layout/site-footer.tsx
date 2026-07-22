import Link from "next/link";
import type { Site } from "@/features/tenant/types";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { BrandMark } from "@/components/layout/brand-mark";
import { resolveSiteLogoUrl } from "@/features/tenant/brand";

export function SiteFooter({ site }: { site: Site }) {
  return (
    <footer className="border-t border-surface-border bg-brand text-brand-fg">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandMark
            name={site.name}
            logoUrl={resolveSiteLogoUrl(site)}
            inverted
          />
          <p className="mt-3 max-w-sm text-sm text-brand-fg/75">
            {ONERIO_VOICE.footer.blurb}
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-brand-fg">
            Explorar
          </p>
          <ul className="mt-3 space-y-2 text-sm text-brand-fg/75">
            <li>
              <Link href="/atracoes" className="hover:text-brand-fg">
                Atrações
              </Link>
            </li>
            <li>
              <Link href="/passaportes" className="hover:text-brand-fg">
                Passaportes
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-brand-fg">
            Contato
          </p>
          <ul className="mt-3 space-y-2 text-sm text-brand-fg/75">
            <li>{site.contactEmail}</li>
            {site.supportPhone ? <li>{site.supportPhone}</li> : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-fg/15 py-4">
        <p className="container text-xs text-brand-fg/55">
          © {new Date().getFullYear()} {site.name}. {ONERIO_VOICE.tagline}
        </p>
      </div>
    </footer>
  );
}
