import { AdminOrdersPanel } from "@/components/admin/admin-orders-panel";

export default function AdminPedidosPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Pedidos</h1>
        <p className="mt-1 text-ink-muted">Listagem operacional com filtro por status e cliente.</p>
      </header>
      <AdminOrdersPanel />
    </div>
  );
}
