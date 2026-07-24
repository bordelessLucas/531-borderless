"use client";

import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { listAllAttractions, listAllProducts, listPartners } from "@/lib/repository";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/components/admin/use-admin-data";

const modeLabel: Record<string, string> = {
  SCHEDULED: "Data e horário",
  DATED: "Data livre",
  OPEN: "Sem data",
};

export default function AdminAtracoesPage() {
  const { data, error, isLoading } = useAdminData(async () => {
    const [attractions, products, partners] = await Promise.all([
      listAllAttractions(),
      listAllProducts(),
      listPartners(),
    ]);
    return {
      attractions,
      simpleByAttraction: new Map(
        products
          .filter((p) => p.type === "SIMPLE" && p.attractionId)
          .map((p) => [p.attractionId!, p]),
      ),
      partnersById: new Map(partners.map((p) => [p.id, p])),
    };
  }, "atracoes");

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Atrações</h1>
          <p className="mt-1 text-ink-muted">
            Cadastro, ingressos, calendário e publicação na vitrine.
          </p>
        </div>
        <Link href="/admin/atracoes/editor">
          <Button>
            <Plus className="h-4 w-4" /> Nova atração
          </Button>
        </Link>
      </header>

      {error ? <p className="mb-6 text-sm text-red-600">{error}</p> : null}
      {isLoading ? <p className="text-sm text-ink-muted">Carregando atrações…</p> : null}

      {data ? (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-surface-border bg-surface-subtle text-xs uppercase text-ink-subtle">
              <tr>
                <th className="px-5 py-3 font-medium">Atração</th>
                <th className="px-5 py-3 font-medium">Parceiro</th>
                <th className="px-5 py-3 font-medium">Disponibilidade</th>
                <th className="px-5 py-3 font-medium">Emissão</th>
                <th className="px-5 py-3 font-medium">Vitrine</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {data.attractions.map((a) => {
                const partner = data.partnersById.get(a.partnerId);
                const product = data.simpleByAttraction.get(a.id);
                return (
                  <tr key={a.id} className="transition-colors hover:bg-surface-subtle">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/atracoes/editor?id=${a.id}`}
                        className="font-medium text-ink hover:text-brand"
                      >
                        {a.name}
                      </Link>
                      <p className="text-xs text-ink-subtle">{a.city}</p>
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{partner?.name ?? "—"}</td>
                    <td className="px-5 py-4 text-ink-muted">
                      {modeLabel[a.availability.mode]}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">
                      {partner?.defaultStrategy === "API" ? "API" : "Manual"}
                    </td>
                    <td className="px-5 py-4">
                      {product?.status === "PUBLISHED" ? (
                        <Link
                          href={`/atracoes/${product.slug}`}
                          className="inline-flex items-center gap-1 text-brand hover:underline"
                        >
                          Na loja <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      ) : product ? (
                        <span className="text-xs text-ink-subtle">Rascunho</span>
                      ) : (
                        <span className="text-xs text-amber-700">Salve para publicar</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          a.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-surface-subtle text-ink-muted"
                        }`}
                      >
                        {a.status === "PUBLISHED" ? "Publicada" : a.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}
