"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  listAllAttractions,
  listAllProducts,
  listAllTicketTypes,
} from "@/lib/repository";
import { PassportEditor } from "@/components/admin/passport-editor";
import { useAdminData } from "@/components/admin/use-admin-data";

function PassportEditorScreen() {
  const passportId = useSearchParams().get("id");

  const { data, error, isLoading } = useAdminData(async () => {
    const [products, attractions, ticketTypes] = await Promise.all([
      listAllProducts(),
      listAllAttractions(),
      listAllTicketTypes(),
    ]);
    const product = passportId
      ? (products.find((p) => p.id === passportId && p.type === "PASSPORT") ?? null)
      : null;
    return { product, attractions, ticketTypes };
  }, passportId ?? "novo");

  return (
    <div>
      <Link
        href="/admin/passaportes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>

      {isLoading ? <p className="text-sm text-ink-muted">Carregando passaporte…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {passportId && data && !data.product ? (
        <p className="text-sm text-ink-muted">Passaporte não encontrado.</p>
      ) : null}

      {data && (!passportId || data.product) ? (
        <>
          <h1 className="mb-6 font-display text-3xl font-semibold text-ink">
            {data.product ? data.product.name : "Novo passaporte"}
          </h1>
          <PassportEditor
            product={data.product}
            attractions={data.attractions}
            ticketTypes={data.ticketTypes}
          />
        </>
      ) : null}
    </div>
  );
}

export default function PassportEditorPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Carregando…</p>}>
      <PassportEditorScreen />
    </Suspense>
  );
}
