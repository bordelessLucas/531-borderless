import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  listAllAttractions,
  listAllProducts,
  listAllTicketTypes,
} from "@/lib/repository";
import { PassportEditor } from "@/components/admin/passport-editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { listAllProducts } = await import("@/lib/repository");
  const products = await listAllProducts();
  return [
    { id: "novo" },
    ...products.filter((p) => p.type === "PASSPORT").map((p) => ({ id: p.id })),
  ];
}

export default async function PassportEditorPage({ params }: PageProps) {
  const { id } = await params;
  const isNew = id === "novo";
  const products = await listAllProducts();
  const product = isNew
    ? null
    : (products.find((p) => p.id === id && p.type === "PASSPORT") ?? null);
  if (!isNew && !product) notFound();

  const attractions = await listAllAttractions();
  const ticketTypes = await listAllTicketTypes();

  return (
    <div>
      <Link
        href="/admin/passaportes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">
        {isNew ? "Novo passaporte" : product!.name}
      </h1>
      <PassportEditor
        product={product}
        attractions={attractions}
        ticketTypes={ticketTypes}
      />
    </div>
  );
}
