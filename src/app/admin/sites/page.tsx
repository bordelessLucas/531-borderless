import { getPartnerById, listSites } from "@/lib/repository";
import { Card } from "@/components/ui/card";

export default function AdminSitesPage() {
  const sites = listSites();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Sites (multi-tenant)</h1>
        <p className="mt-1 text-ink-muted">
          O site principal OneRio e os sites whitelabel de parceiros — mesma plataforma, temas e catálogos diferentes.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {sites.map((site) => {
          const partner = site.partnerId ? getPartnerById(site.partnerId) : null;
          return (
            <Card key={site.id} className="p-6">
              <div className="flex items-center gap-3">
                <span
                  className="h-10 w-10 rounded-xl"
                  style={{ backgroundColor: `rgb(${site.theme.brand})` }}
                />
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">{site.name}</h2>
                  <p className="text-xs text-ink-subtle">
                    {site.attractionIds === null ? "Catálogo completo" : `${site.attractionIds.length} atração(ões)`}
                    {partner ? ` · ${partner.name}` : ""}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium uppercase text-ink-subtle">Domínios</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {site.domains.map((d) => (
                    <span key={d} className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-ink-muted">{d}</span>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
