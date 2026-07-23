"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import type {
  Attraction,
  AvailabilityPolicy,
  ContentBlock,
  TicketType,
} from "@/features/attractions/types";
import type { Partner } from "@/features/partners/types";
import type { PublishStatus } from "@/features/shared/types";
import type { Product } from "@/features/catalog/types";
import { PRODUCT_CATEGORY_LABELS } from "@/features/catalog/categories";
import { saveAttractionDraft } from "@/features/attractions/staff-writes";
import {
  AvailabilityEditor,
  defaultAvailability,
} from "@/components/admin/availability-editor";
import { ContentBlocksEditor } from "@/components/admin/content-blocks-editor";
import { TicketTypesEditor } from "@/components/admin/ticket-types-editor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AttractionEditorProps {
  attraction: Attraction | null;
  partners: Partner[];
  ticketTypes: TicketType[];
  /** Product SIMPLE vinculado (se já existir). */
  linkedProduct?: Product | null;
}

const CATEGORY_OPTIONS = Object.entries(PRODUCT_CATEGORY_LABELS).filter(
  ([key]) => key !== "passaporte",
);

export function AttractionEditor({
  attraction,
  partners,
  ticketTypes,
  linkedProduct = null,
}: AttractionEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(attraction?.name ?? "");
  const [slug, setSlug] = useState(attraction?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(
    attraction?.shortDescription ?? "",
  );
  const [city, setCity] = useState(attraction?.city ?? "");
  const [partnerId, setPartnerId] = useState(
    attraction?.partnerId ?? partners[0]?.id ?? "",
  );
  const [heroImageUrl, setHeroImageUrl] = useState(attraction?.heroImage.url ?? "");
  const [status, setStatus] = useState<PublishStatus>(attraction?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(linkedProduct?.featured ?? false);
  const [category, setCategory] = useState<Product["category"]>(
    linkedProduct?.category ?? "familia",
  );
  const [highlightsText, setHighlightsText] = useState(
    (attraction?.highlights ?? []).join("\n"),
  );
  const [usageRulesText, setUsageRulesText] = useState(
    (attraction?.usageRules ?? []).join("\n"),
  );
  const [availability, setAvailability] = useState<AvailabilityPolicy>(
    attraction?.availability ?? defaultAvailability(),
  );
  const [content, setContent] = useState<ContentBlock[]>(attraction?.content ?? []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSave() {
    if (!partnerId || name.length < 3 || slug.length < 3 || shortDescription.length < 10) {
      setMessage({ ok: false, text: "Preencha nome, slug, descrição e parceiro." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const highlights = highlightsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const usageRules = usageRulesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const id = await saveAttractionDraft({
        id: attraction?.id,
        partnerId,
        name: name.trim(),
        slug: slug.trim(),
        shortDescription: shortDescription.trim(),
        city: city.trim() || "Rio de Janeiro",
        heroImageUrl:
          heroImageUrl.trim() ||
          "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600",
        availability,
        content,
        highlights,
        usageRules,
        status,
        featured,
        category,
        metaTitle: attraction?.metaTitle,
        metaDescription: attraction?.metaDescription,
      });
      setMessage({
        ok: true,
        text:
          status === "PUBLISHED"
            ? "Atração salva e produto publicado na vitrine."
            : "Atração salva. Publique para aparecer na loja.",
      });
      if (!attraction) {
        router.replace(`/admin/atracoes/${id}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err) {
      setMessage({
        ok: false,
        text:
          err instanceof Error
            ? err.message
            : "Erro ao salvar (verifique se você é staff).",
      });
    } finally {
      setBusy(false);
    }
  }

  const storefrontHref = `/atracoes/${slug.trim() || attraction?.slug || ""}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Informações gerais</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField label="Nome" value={name} onChange={setName} />
              <TextField label="Slug" value={slug} onChange={setSlug} />
              <div className="sm:col-span-2">
                <TextField
                  label="Descrição curta"
                  value={shortDescription}
                  onChange={setShortDescription}
                />
              </div>
              <TextField label="Cidade" value={city} onChange={setCity} />
              <label className="block">
                <span className="text-sm font-medium text-ink">Parceiro</span>
                <select
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.defaultStrategy === "API" ? "API" : "Manual"})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">Categoria na vitrine</span>
                <select
                  value={category ?? ""}
                  onChange={(e) =>
                    setCategory((e.target.value || undefined) as Product["category"])
                  }
                  className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
                >
                  {CATEGORY_OPTIONS.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-2">
                <TextField
                  label="Imagem principal (URL)"
                  value={heroImageUrl}
                  onChange={setHeroImageUrl}
                />
              </div>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-ink">Destaques (1 por linha)</span>
                <textarea
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm"
                  placeholder="Vista panorâmica&#10;Ideal para famílias"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-ink">Regras de uso (1 por linha)</span>
                <textarea
                  value={usageRulesText}
                  onChange={(e) => setUsageRulesText(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm"
                  placeholder="Documento com foto&#10;Não reembolsável"
                />
              </label>
            </div>
          </Card>

          <AvailabilityEditor value={availability} onChange={setAvailability} />
          <ContentBlocksEditor value={content} onChange={setContent} />
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Publicação</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Ao salvar, o produto da vitrine é criado/atualizado automaticamente.
            </p>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-ink">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PublishStatus)}
                className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
              >
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicada</option>
                <option value="ARCHIVED">Arquivada</option>
              </select>
            </label>
            <label className="mt-3 flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Destaque na home
            </label>
            <Button className="mt-5 w-full" disabled={busy} onClick={() => void onSave()}>
              {busy ? "Salvando…" : "Salvar atração"}
            </Button>
            {attraction && slug ? (
              <Link
                href={storefrontHref}
                target="_blank"
                className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-brand hover:underline"
              >
                Ver na loja <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            {message ? (
              <p
                className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                  message.ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {message.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                {message.text}
              </p>
            ) : null}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink">Emissão</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              A forma de emissão (Manual ou API) vem do <strong>parceiro</strong> e pode ser
              sobrescrita em cada ingresso abaixo. Pedidos manuais caem na fila do admin.
            </p>
          </Card>
        </div>
      </div>

      {attraction ? (
        <TicketTypesEditor attractionId={attraction.id} initial={ticketTypes} />
      ) : (
        <Card className="p-6 text-sm text-ink-muted">
          Salve a atração primeiro para cadastrar categorias de ingresso.
        </Card>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}
