import { AdminQueueLoader } from "@/components/admin/admin-queue-loader";

export default function FilaPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Fila de emissão manual</h1>
        <p className="mt-1 text-ink-muted">
          Atrativos sem integração: emita no portal do parceiro e anexe os bilhetes ao pedido.
        </p>
      </header>
      <AdminQueueLoader />
    </div>
  );
}
