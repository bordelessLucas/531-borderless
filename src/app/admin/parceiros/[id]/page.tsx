import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getPartnerById } from "@/lib/repository";
import { PartnerEditor } from "@/components/admin/partner-editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { listPartners } = await import("@/lib/repository");
  const partners = await listPartners();
  return [{ id: "novo" }, ...partners.map((p) => ({ id: p.id }))];
}

export default async function PartnerEditorPage({ params }: PageProps) {
  const { id } = await params;
  const isNew = id === "novo";
  const partner = isNew ? null : await getPartnerById(id);
  if (!isNew && !partner) notFound();

  return (
    <div>
      <Link
        href="/admin/parceiros"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">
        {isNew ? "Novo parceiro" : partner!.name}
      </h1>
      <PartnerEditor partner={partner} />
    </div>
  );
}
