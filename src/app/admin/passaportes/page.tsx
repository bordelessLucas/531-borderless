"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { listAllAttractions, listAllProducts } from "@/lib/repository";
import { formatMoney } from "@/features/shared/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData } from "@/components/admin/use-admin-data";

export default function AdminPassaportesPage() {
  const { data, error, isLoading } = useAdminData(async () => {
    const [products, attractions] = await Promise.all([
      listAllProducts(),
      listAllAttractions(),
    ]);
    const attractionsById = new Map(attractions.map((a) => [a.id, a]));
    return products
      .filter((p) => p.type === "PASSPORT")
      .map((product) => ({
        product,
        items: (product.composition?.items ?? []).map((item) => ({
          item,
          attraction: attractionsById.get(item.attractionId) ?? null,
        })),
      }));
  }, "passaportes");

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Passaportes</h1>
          <p className="mt-1 text-ink-muted">Produtos compostos por múltiplas atrações.</p>
        </div>
        <Link href="/admin/passaportes/editor">
          <Button>
            <Plus className="h-4 w-4" /> Novo passaporte
          </Button>
        </Link>
      </header>

      {error ? <p className="mb-6 text-sm text-red-600">{error}</p> : null}
      {isLoading ? <p className="text-sm text-ink-muted">Carregando passaportes…</p> : null}

      <div className="grid gap-5 md:grid-cols-2">
        {(data ?? []).map(({ product: p, items }) => (
          <Link key={p.id} href={`/admin/passaportes/editor?id=${p.id}`}>
            <Card className="p-6 transition-colors hover:border-brand">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">{p.name}</h2>
                  <p className="text-sm text-ink-muted">{p.tagline}</p>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
                  {formatMoney(p.passportPrice ?? p.fromPrice)}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium uppercase text-ink-subtle">Composição</p>
                {items.map(({ item, attraction }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2 text-sm"
                  >
                    <span className="text-ink">{attraction?.name ?? item.attractionId}</span>
                    <span className="text-xs text-ink-subtle">
                      {item.quantity}x · {item.required ? "obrigatório" : "opcional"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
