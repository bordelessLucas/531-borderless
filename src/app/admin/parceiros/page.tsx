import Link from "next/link";
import { Plus } from "lucide-react";
import { listPartners } from "@/lib/repository";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminParceirosPage() {
  const partners = await listPartners();

  return (
    <div>
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Parceiros</h1>
          <p className="mt-1 text-ink-muted">
            Fornecedores, integração e regras de repasse.
          </p>
        </div>
        <Link href="/admin/parceiros/novo">
          <Button>
            <Plus className="h-4 w-4" /> Novo parceiro
          </Button>
        </Link>
      </header>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border bg-surface-subtle text-xs uppercase text-ink-subtle">
            <tr>
              <th className="px-5 py-3 font-medium">Parceiro</th>
              <th className="px-5 py-3 font-medium">Emissão padrão</th>
              <th className="px-5 py-3 font-medium">Integração</th>
              <th className="px-5 py-3 font-medium">Comissão</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {partners.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-surface-subtle">
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/parceiros/${p.id}`}
                    className="font-medium text-ink hover:text-brand"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-ink-subtle">{p.slug}</p>
                </td>
                <td className="px-5 py-4 text-ink-muted">
                  {p.defaultStrategy === "API" ? "Automática" : "Manual"}
                </td>
                <td className="px-5 py-4 text-ink-muted">
                  {p.integration?.adapterKey ?? "—"}
                </td>
                <td className="px-5 py-4 text-ink-muted">
                  {(p.commissionBps / 100).toFixed(1)}%
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      p.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-surface-subtle text-ink-subtle"
                    }`}
                  >
                    {p.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
