import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "@/features/auth/server";
import { OrderDetail } from "@/components/account/orders-panel";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Detalhe do pedido" };

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateStaticParams() {
  // Preview estático: placeholder. Pedidos reais abrem via client no runtime SSR.
  return [{ orderId: "preview" }];
}

export default async function ContaPedidoDetailPage({ params }: PageProps) {
  const session = await getServerSession();
  const { orderId } = await params;

  if (!session) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Entre para ver o pedido</h1>
        <Link href={`/login?next=/conta/pedidos/${orderId}`} className="mt-6 inline-block">
          <Button>Entrar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <OrderDetail orderId={orderId} />
    </div>
  );
}
