import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/features/auth/server";
import { OrderDetail } from "@/components/account/orders-panel";

export const metadata: Metadata = { title: "Detalhe do pedido" };

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function ContaPedidoDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session) redirect("/login?next=/conta/pedidos");

  const { orderId } = await params;
  return (
    <div className="container py-12">
      <OrderDetail orderId={orderId} />
    </div>
  );
}
