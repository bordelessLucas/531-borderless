import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getSiteById,
  listAllAttractions,
  listPartners,
} from "@/lib/repository";
import { SiteEditor } from "@/components/admin/site-editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SiteEditorPage({ params }: PageProps) {
  const { id } = await params;
  const isNew = id === "novo";
  const site = isNew ? null : await getSiteById(id);
  if (!isNew && !site) notFound();

  const [partners, attractions] = await Promise.all([
    listPartners(),
    listAllAttractions(),
  ]);

  return (
    <div>
      <Link
        href="/admin/sites"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">
        {isNew ? "Novo site" : site!.name}
      </h1>
      <SiteEditor site={site} partners={partners} attractions={attractions} />
    </div>
  );
}
