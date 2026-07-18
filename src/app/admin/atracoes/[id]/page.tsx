import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getAttractionById, listPartners } from "@/lib/repository";
import { AttractionEditor } from "@/components/admin/attraction-editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AttractionEditorPage({ params }: PageProps) {
  const { id } = await params;
  const isNew = id === "nova";
  const attraction = isNew ? null : getAttractionById(id);
  if (!isNew && !attraction) notFound();
  const partners = listPartners();

  return (
    <div>
      <Link href="/admin/atracoes" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">
        {isNew ? "Nova atração" : attraction!.name}
      </h1>
      <AttractionEditor attraction={attraction} partners={partners} />
    </div>
  );
}
