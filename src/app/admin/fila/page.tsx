import { listManualFulfillments } from "@/lib/repository";
import { FulfillmentQueue } from "@/components/admin/fulfillment-queue";

export default function FilaPage() {
  const items = listManualFulfillments();
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Fila de emissão manual</h1>
        <p className="mt-1 text-ink-muted">
          Atrativos sem integração: emita no portal do parceiro e anexe os bilhetes ao pedido.
        </p>
      </header>
      <FulfillmentQueue items={items} />
    </div>
  );
}
