"use client";

import { listAllProducts, listAttractions, listPartners } from "@/lib/repository";
import { AdminPendingSummary } from "@/components/admin/admin-queue-loader";
import { useAdminData } from "@/components/admin/use-admin-data";

export default function AdminDashboard() {
  const { data, error } = useAdminData(async () => {
    const [attractions, products, partners] = await Promise.all([
      listAttractions(),
      listAllProducts(),
      listPartners(),
    ]);
    return {
      attractions: attractions.length,
      passports: products.filter((p) => p.type === "PASSPORT").length,
      partners: partners.length,
    };
  }, "dashboard");

  const stats = [
    {
      label: "Atrações",
      value: data?.attractions ?? 0,
      icon: "attractions" as const,
      href: "/admin/atracoes",
    },
    {
      label: "Passaportes",
      value: data?.passports ?? 0,
      icon: "passports" as const,
      href: "/admin/passaportes",
    },
    {
      label: "Parceiros",
      value: data?.partners ?? 0,
      icon: "partners" as const,
      href: "/admin/parceiros",
    },
    { label: "Na fila de emissão", value: 0, icon: "queue" as const, href: "/admin/fila" },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Visão geral</h1>
        <p className="mt-1 text-ink-muted">Operação da OneRio em um só lugar.</p>
      </header>

      {error ? <p className="mb-6 text-sm text-red-600">{error}</p> : null}

      <AdminPendingSummary stats={stats} />
    </div>
  );
}
