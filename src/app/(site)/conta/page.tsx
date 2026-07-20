import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/features/auth/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Minha conta" };

export default async function ContaPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?next=/conta");

  return (
    <div className="container py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Olá, {session.name ?? "cliente"}</h1>
        <p className="mt-1 text-ink-muted">{session.email}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Meus pedidos</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Acompanhe status e baixe bilhetes emitidos.
          </p>
          <Link href="/conta/pedidos" className="mt-5 inline-block">
            <Button>Ver pedidos</Button>
          </Link>
        </Card>

        {session.role === "admin" || session.role === "operator" ? (
          <Card className="p-6">
            <h2 className="font-display text-xl font-semibold text-ink">Backoffice</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Você tem acesso staff ({session.role}).
            </p>
            <Link href="/admin" className="mt-5 inline-block">
              <Button variant="secondary">Abrir admin</Button>
            </Link>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
