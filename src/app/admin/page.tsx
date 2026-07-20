import Link from "next/link";
import { Building2, Inbox, MapPinned, Ticket } from "lucide-react";
import { listAllProducts, listAttractions, listPartners } from "@/lib/repository";
import { AdminPendingSummary } from "@/components/admin/admin-queue-loader";

export default async function AdminDashboard() {
  const [attractions, products, partners] = await Promise.all([
    listAttractions(),
    listAllProducts(),
    listPartners(),
  ]);
  const passports = products.filter((p) => p.type === "PASSPORT");

  const stats = [
    { label: "Atrações", value: attractions.length, icon: MapPinned, href: "/admin/atracoes" },
    { label: "Passaportes", value: passports.length, icon: Ticket, href: "/admin/passaportes" },
    { label: "Parceiros", value: partners.length, icon: Building2, href: "/admin/parceiros" },
    { label: "Na fila de emissão", value: 0, icon: Inbox, href: "/admin/fila" },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Visão geral</h1>
        <p className="mt-1 text-ink-muted">Operação da OneRio em um só lugar.</p>
      </header>

      <AdminPendingSummary stats={stats} />
    </div>
  );
}
