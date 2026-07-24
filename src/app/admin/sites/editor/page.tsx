"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getSiteById, listAllAttractions, listPartners } from "@/lib/repository";
import { SiteEditor } from "@/components/admin/site-editor";
import { useAdminData } from "@/components/admin/use-admin-data";

function SiteEditorScreen() {
  const siteId = useSearchParams().get("id");

  const { data, error, isLoading } = useAdminData(async () => {
    const [site, partners, attractions] = await Promise.all([
      siteId ? getSiteById(siteId) : Promise.resolve(null),
      listPartners(),
      listAllAttractions(),
    ]);
    return { site, partners, attractions };
  }, siteId ?? "novo");

  return (
    <div>
      <Link
        href="/admin/sites"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>

      {isLoading ? <p className="text-sm text-ink-muted">Carregando site…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {siteId && data && !data.site ? (
        <p className="text-sm text-ink-muted">Site não encontrado.</p>
      ) : null}

      {data && (!siteId || data.site) ? (
        <>
          <h1 className="mb-6 font-display text-3xl font-semibold text-ink">
            {data.site ? data.site.name : "Novo site"}
          </h1>
          <SiteEditor
            site={data.site}
            partners={data.partners}
            attractions={data.attractions}
          />
        </>
      ) : null}
    </div>
  );
}

export default function SiteEditorPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Carregando…</p>}>
      <SiteEditorScreen />
    </Suspense>
  );
}
