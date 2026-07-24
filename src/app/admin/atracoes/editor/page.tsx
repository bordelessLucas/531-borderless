"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getAttractionById,
  listAllProducts,
  listPartners,
  listTicketTypesByAttractionAdmin,
} from "@/lib/repository";
import { AttractionEditor } from "@/components/admin/attraction-editor";
import { useAdminData } from "@/components/admin/use-admin-data";

function AttractionEditorScreen() {
  const attractionId = useSearchParams().get("id");

  const { data, error, isLoading } = useAdminData(async () => {
    const attraction = attractionId ? await getAttractionById(attractionId) : null;
    const [partners, products] = await Promise.all([listPartners(), listAllProducts()]);
    const ticketTypes = attraction
      ? await listTicketTypesByAttractionAdmin(attraction.id)
      : [];
    const linkedProduct = attraction
      ? (products.find((p) => p.type === "SIMPLE" && p.attractionId === attraction.id) ??
        null)
      : null;
    return { attraction, partners, ticketTypes, linkedProduct };
  }, attractionId ?? "nova");

  return (
    <div>
      <Link
        href="/admin/atracoes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>

      {isLoading ? <p className="text-sm text-ink-muted">Carregando atração…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {attractionId && data && !data.attraction ? (
        <p className="text-sm text-ink-muted">Atração não encontrada.</p>
      ) : null}

      {data && (!attractionId || data.attraction) ? (
        <>
          <h1 className="mb-6 font-display text-3xl font-semibold text-ink">
            {data.attraction ? data.attraction.name : "Nova atração"}
          </h1>
          <AttractionEditor
            attraction={data.attraction}
            partners={data.partners}
            ticketTypes={data.ticketTypes}
            linkedProduct={data.linkedProduct}
          />
        </>
      ) : null}
    </div>
  );
}

export default function AttractionEditorPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Carregando…</p>}>
      <AttractionEditorScreen />
    </Suspense>
  );
}
