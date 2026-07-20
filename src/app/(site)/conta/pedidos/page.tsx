import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/features/auth/server";
import { OrdersList } from "@/components/account/orders-panel";

export const metadata: Metadata = { title: "Meus pedidos" };

export default async function ContaPedidosPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?next=/conta/pedidos");

  return (
    <div className="container py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Meus pedidos</h1>
        <p className="mt-1 text-ink-muted">Histórico de compras e bilhetes disponíveis.</p>
      </header>
      <OrdersList />
    </div>
  );
}
