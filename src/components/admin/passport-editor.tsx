"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import type { ContentBlock } from "@/features/attractions/types";
import type { Attraction, TicketType } from "@/features/attractions/types";
import type { PassportItem, Product } from "@/features/catalog/types";
import type { PublishStatus } from "@/features/shared/types";
import { savePassportDraft } from "@/features/attractions/staff-writes";
import { ContentBlocksEditor } from "@/components/admin/content-blocks-editor";
import { formatMoney } from "@/features/shared/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PassportEditorProps {
  product: Product | null;
  attractions: Attraction[];
  ticketTypes: TicketType[];
}

export function PassportEditor({ product, attractions, ticketTypes }: PassportEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(product?.heroImage.url ?? "");
  const [status, setStatus] = useState<PublishStatus>(product?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [priceReais, setPriceReais] = useState(
    ((product?.passportPrice ?? product?.fromPrice)?.amount ?? 0) / 100,
  );
  const [content, setContent] = useState<ContentBlock[]>(product?.content ?? []);
  const [items, setItems] = useState<PassportItem[]>(product?.composition?.items ?? []);
  const [minOptional, setMinOptional] = useState(
    product?.composition?.minOptionalSelections ?? 0,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const ticketsByAttraction = (attractionId: string) =>
    ticketTypes.filter((t) => t.attractionId === attractionId && t.isActive);

  function addItem() {
    const attraction = attractions[0];
    if (!attraction) return;
    const tt = ticketsByAttraction(attraction.id)[0];
    if (!tt) {
      setMessage({ ok: false, text: "Cadastre categorias na atração antes." });
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        id: `pi-${Date.now()}`,
        attractionId: attraction.id,
        ticketTypeId: tt.id,
        quantity: 1,
        required: true,
        order: prev.length + 1,
      },
    ]);
  }

  async function onSave() {
    const amount = Math.round(Number(priceReais) * 100);
    if (name.length < 3 || slug.length < 3 || items.length === 0 || Number.isNaN(amount)) {
      setMessage({ ok: false, text: "Nome, slug, preço e ao menos 1 item são obrigatórios." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const id = await savePassportDraft({
        id: product?.id,
        name: name.trim(),
        slug: slug.trim(),
        tagline: tagline.trim() || name.trim(),
        heroImageUrl:
          heroImageUrl.trim() ||
          "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=1600",
        content,
        composition: {
          items: items.map((it, i) => ({ ...it, order: i + 1 })),
          minOptionalSelections: minOptional > 0 ? minOptional : undefined,
        },
        passportPriceAmount: amount,
        fromPriceAmount: amount,
        status,
        featured,
      });
      setMessage({ ok: true, text: "Passaporte salvo." });
      if (!product) {
        router.replace(`/admin/passaportes/${id}`);
        router.refresh();
      }
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Erro ao salvar.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Dados do passaporte</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nome" value={name} onChange={setName} />
            <Field label="Slug" value={slug} onChange={setSlug} />
            <div className="sm:col-span-2">
              <Field label="Tagline" value={tagline} onChange={setTagline} />
            </div>
            <Field label="Imagem (URL)" value={heroImageUrl} onChange={setHeroImageUrl} />
            <Field
              label="Preço (R$)"
              value={String(priceReais)}
              onChange={(v) => setPriceReais(Number(v.replace(",", ".")) || 0)}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Composição</h2>
              <p className="text-sm text-ink-muted">Atrações e categorias inclusas.</p>
            </div>
            <Button type="button" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4" /> Item
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {items.map((item, index) => {
              const tts = ticketsByAttraction(item.attractionId);
              const selectedTt = ticketTypes.find((t) => t.id === item.ticketTypeId);
              const attraction = attractions.find((a) => a.id === item.attractionId);
              const partnerStrategy =
                selectedTt?.strategy ??
                null;
              return (
                <div
                  key={item.id}
                  className="space-y-2 rounded-xl border border-surface-border p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_80px_auto_auto]">
                  <select
                    value={item.attractionId}
                    onChange={(e) => {
                      const attractionId = e.target.value;
                      const firstTt = ticketsByAttraction(attractionId)[0];
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === index
                            ? {
                                ...it,
                                attractionId,
                                ticketTypeId: firstTt?.id ?? it.ticketTypeId,
                              }
                            : it,
                        ),
                      );
                    }}
                    className="h-10 rounded-lg border border-surface-border px-2 text-sm"
                  >
                    {attractions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={item.ticketTypeId}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === index ? { ...it, ticketTypeId: e.target.value } : it,
                        ),
                      )
                    }
                    className="h-10 rounded-lg border border-surface-border px-2 text-sm"
                  >
                    {tts.map((tt) => (
                      <option key={tt.id} value={tt.id}>
                        {tt.name} ({formatMoney(tt.price)})
                        {tt.strategy ? ` · ${tt.strategy}` : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, i) =>
                          i === index
                            ? { ...it, quantity: Number(e.target.value) || 1 }
                            : it,
                        ),
                      )
                    }
                    className="h-10 rounded-lg border border-surface-border px-2 text-sm"
                  />
                  <label className="flex items-center gap-1 text-xs text-ink-muted">
                    <input
                      type="checkbox"
                      checked={item.required}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === index ? { ...it, required: e.target.checked } : it,
                          ),
                        )
                      }
                    />
                    Obrig.
                  </label>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4 text-ink-subtle" />
                  </button>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Emissão deste item:{" "}
                    <strong className="text-ink">
                      {partnerStrategy === "API"
                        ? "API (automática)"
                        : partnerStrategy === "MANUAL"
                          ? "Manual (fila)"
                          : "Herdada do parceiro da atração"}
                    </strong>
                    {attraction ? (
                      <>
                        {" "}
                        — configure em{" "}
                        <a
                          href={`/admin/atracoes/${attraction.id}`}
                          className="text-brand hover:underline"
                        >
                          {attraction.name}
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
              );
            })}
            {items.length === 0 ? (
              <p className="text-sm text-ink-subtle">Adicione atrações à composição.</p>
            ) : null}
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-surface-border p-4">
            <label className="block text-sm font-medium text-ink">
              Mínimo de itens opcionais (escolha N de M)
            </label>
            <p className="mt-1 text-xs text-ink-muted">
              Se houver itens não obrigatórios, o cliente precisa escolher pelo menos este
              número. Deixe 0 para não exigir.
            </p>
            <input
              type="number"
              min={0}
              value={minOptional}
              onChange={(e) => setMinOptional(Number(e.target.value) || 0)}
              className="mt-2 h-10 w-28 rounded-lg border border-surface-border px-3 text-sm"
            />
          </div>
        </Card>

        <ContentBlocksEditor value={content} onChange={setContent} />
      </div>

      <Card className="h-fit p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Publicação</h2>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-ink">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PublishStatus)}
            className="mt-1.5 h-11 w-full rounded-xl border border-surface-border px-3.5 text-sm"
          >
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Arquivado</option>
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
          {busy ? "Salvando…" : "Salvar passaporte"}
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
  );
}

function Field({
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
        className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}
