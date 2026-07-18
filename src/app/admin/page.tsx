import Link from "next/link";
import { ArrowRight, Building2, Inbox, MapPinned, Ticket } from "lucide-react";
import {
  listAllProducts,
  listAttractions,
  listManualFulfillments,
  listPartners,
} from "@/lib/repository";
import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  const attractions = listAttractions();
  const products = listAllProducts();
  const passports = products.filter((p) => p.type === "PASSPORT");
  const partners = listPartners();
  const queue = listManualFulfillments();
  const pending = queue.filter((f) => f.status === "PENDING" || f.status === "PROCESSING");

  const stats = [
    { label: "Atrações", value: attractions.length, icon: MapPinned, href: "/admin/atracoes" },
    { label: "Passaportes", value: passports.length, icon: Ticket, href: "/admin/passaportes" },
    { label: "Parceiros", value: partners.length, icon: Building2, href: "/admin/parceiros" },
    { label: "Na fila de emissão", value: pending.length, icon: Inbox, href: "/admin/fila" },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Visão geral</h1>
        <p className="mt-1 text-ink-muted">Operação da OneRio em um só lugar.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-5 transition-colors hover:border-brand">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <stat.icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-ink-subtle" />
              </div>
              <p className="mt-4 font-display text-3xl font-semibold text-ink">{stat.value}</p>
              <p className="text-sm text-ink-muted">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Emissões pendentes</h2>
          <Link href="/admin/fila" className="text-sm font-medium text-brand hover:underline">
            Abrir fila
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-surface-border">
          {pending.map((f) => (
            <li key={f.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-ink">{f.snapshot.attractionName}</p>
                <p className="text-xs text-ink-subtle">
                  {f.snapshot.customerName} · {f.snapshot.quantity} ingresso(s) · pedido {f.orderId}
                </p>
              </div>
              <span className="rounded-full bg-brand-muted/15 px-3 py-1 text-xs font-medium text-brand-muted">
                {f.status === "PENDING" ? "Pendente" : "Em emissão"}
              </span>
            </li>
          ))}
          {pending.length === 0 ? <li className="py-3 text-sm text-ink-subtle">Nenhuma emissão pendente.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
