import { Plus } from "lucide-react";
import { getAttractionById, listAllProducts } from "@/lib/repository";
import { formatMoney } from "@/features/shared/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminPassaportesPage() {
  const products = await listAllProducts();
  const passports = products.filter((p) => p.type === "PASSPORT");

  const compositionRows = await Promise.all(
    passports.map(async (p) => ({
      product: p,
      items: await Promise.all(
        (p.composition?.items ?? []).map(async (item) => ({
          item,
          attraction: await getAttractionById(item.attractionId),
        })),
      ),
    })),
  );

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Passaportes</h1>
          <p className="mt-1 text-ink-muted">Produtos compostos por múltiplas atrações.</p>
        </div>
        <Button disabled><Plus className="h-4 w-4" /> Novo passaporte</Button>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {compositionRows.map(({ product: p, items }) => (
          <Card key={p.id} className="p-6">
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
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-surface-subtle px-3 py-2 text-sm">
                  <span className="text-ink">{attraction?.name ?? item.attractionId}</span>
                  <span className="text-xs text-ink-subtle">
                    {item.quantity}x · {item.required ? "obrigatório" : "opcional"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
