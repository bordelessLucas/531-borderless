"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPartnerById } from "@/lib/repository";
import { PartnerEditor } from "@/components/admin/partner-editor";
import { useAdminData } from "@/components/admin/use-admin-data";

function PartnerEditorScreen() {
  const partnerId = useSearchParams().get("id");

  const { data, error, isLoading } = useAdminData(
    async () => ({ partner: partnerId ? await getPartnerById(partnerId) : null }),
    partnerId ?? "novo",
  );

  return (
    <div>
      <Link
        href="/admin/parceiros"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>

      {isLoading ? <p className="text-sm text-ink-muted">Carregando parceiro…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {partnerId && data && !data.partner ? (
        <p className="text-sm text-ink-muted">Parceiro não encontrado.</p>
      ) : null}

      {data && (!partnerId || data.partner) ? (
        <>
          <h1 className="mb-6 font-display text-3xl font-semibold text-ink">
            {data.partner ? data.partner.name : "Novo parceiro"}
          </h1>
          <PartnerEditor partner={data.partner} />
        </>
      ) : null}
    </div>
  );
}

export default function PartnerEditorPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Carregando…</p>}>
      <PartnerEditorScreen />
    </Suspense>
  );
}
