"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { listPartners, listSites } from "@/lib/repository";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/components/admin/use-admin-data";

export default function AdminSitesPage() {
  const { data, error, isLoading } = useAdminData(async () => {
    const [sites, partners] = await Promise.all([listSites(), listPartners()]);
    const partnersById = new Map(partners.map((p) => [p.id, p]));
    return sites.map((site) => ({
      site,
      partner: site.partnerId ? (partnersById.get(site.partnerId) ?? null) : null,
    }));
  }, "sites");

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
        <Link href="/admin/sites/editor">
          <Button>
            <Plus className="h-4 w-4" /> Novo site
          </Button>
        </Link>
      </header>

      {error ? <p className="mb-6 text-sm text-red-600">{error}</p> : null}
      {isLoading ? <p className="text-sm text-ink-muted">Carregando sites…</p> : null}

      <div className="grid gap-5 md:grid-cols-2">
        {(data ?? []).map(({ site, partner }) => (
          <Link key={site.id} href={`/admin/sites/editor?id=${site.id}`}>
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
