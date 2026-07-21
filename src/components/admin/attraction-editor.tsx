"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type {
  Attraction,
  AvailabilityPolicy,
  ContentBlock,
  TicketType,
} from "@/features/attractions/types";
import type { Partner } from "@/features/partners/types";
import type { PublishStatus } from "@/features/shared/types";
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
}

export function AttractionEditor({
  attraction,
  partners,
  ticketTypes,
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
        highlights: attraction?.highlights ?? [],
        usageRules: attraction?.usageRules ?? [],
        status,
        metaTitle: attraction?.metaTitle,
        metaDescription: attraction?.metaDescription,
      });
      setMessage({ ok: true, text: "Atração salva." });
      if (!attraction) {
        router.replace(`/admin/atracoes/${id}`);
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
                      {p.name}
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
            </div>
          </Card>

          <AvailabilityEditor value={availability} onChange={setAvailability} />
          <ContentBlocksEditor value={content} onChange={setContent} />
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Publicação</h2>
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
            <Button className="mt-5 w-full" disabled={busy} onClick={() => void onSave()}>
              {busy ? "Salvando…" : "Salvar atração"}
            </Button>
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
