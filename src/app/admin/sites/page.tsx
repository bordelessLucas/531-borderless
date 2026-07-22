import Link from "next/link";
import { Plus } from "lucide-react";
import { getPartnerById, listSites } from "@/lib/repository";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminSitesPage() {
  const sites = await listSites();
  const sitesWithPartner = await Promise.all(
    sites.map(async (site) => ({
      site,
      partner: site.partnerId ? await getPartnerById(site.partnerId) : null,
    })),
  );

  return (
    <div>
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Sites (multi-tenant)
          </h1>
          <p className="mt-1 text-ink-muted">
            O site principal OneRio e os sites whitelabel de parceiros — mesma
            plataforma, temas e catálogos diferentes.
          </p>
        </div>
        <Link href="/admin/sites/novo">
          <Button>
            <Plus className="h-4 w-4" /> Novo site
          </Button>
        </Link>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {sitesWithPartner.map(({ site, partner }) => (
          <Link key={site.id} href={`/admin/sites/${site.id}`}>
            <Card className="h-full p-6 transition-colors hover:border-brand/40">
              <div className="flex items-center gap-3">
                <span
                  className="h-10 w-10 rounded-xl"
                  style={{ backgroundColor: `rgb(${site.theme.brand})` }}
                />
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">
                    {site.name}
                  </h2>
                  <p className="text-xs text-ink-subtle">
                    {site.attractionIds === null
                      ? "Catálogo completo"
                      : `${site.attractionIds.length} atração(ões)`}
                    {partner ? ` · ${partner.name}` : ""}
                    {` · ${site.status}`}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium uppercase text-ink-subtle">Domínios</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {site.domains.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-ink-muted"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
