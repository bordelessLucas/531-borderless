"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Attraction } from "@/features/attractions/types";
import type { Partner } from "@/features/partners/types";
import type { Site } from "@/features/tenant/types";
import type { PublishStatus } from "@/features/shared/types";
import { saveSite } from "@/features/tenant/staff-writes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SiteEditorProps {
  site: Site | null;
  partners: Partner[];
  attractions: Attraction[];
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseDomains(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\n,]+/)
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export function SiteEditor({ site, partners, attractions }: SiteEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(site?.name ?? "");
  const [slug, setSlug] = useState(site?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(site));
  const [domainsRaw, setDomainsRaw] = useState((site?.domains ?? []).join("\n"));
  const [brand, setBrand] = useState(site?.theme.brand ?? "0 8 95");
  const [brandFg, setBrandFg] = useState(site?.theme.brandFg ?? "251 255 225");
  const [brandMuted, setBrandMuted] = useState(site?.theme.brandMuted ?? "255 93 6");
  const [logoUrl, setLogoUrl] = useState(site?.theme.logoUrl ?? "");
  const [faviconUrl, setFaviconUrl] = useState(site?.theme.faviconUrl ?? "");
  const [fullCatalog, setFullCatalog] = useState(site?.attractionIds === null);
  const [selectedAttractionIds, setSelectedAttractionIds] = useState<string[]>(
    site?.attractionIds ?? [],
  );
  const [partnerId, setPartnerId] = useState(site?.partnerId ?? "");
  const [status, setStatus] = useState<PublishStatus>(site?.status ?? "DRAFT");
  const [contactEmail, setContactEmail] = useState(site?.contactEmail ?? "");
  const [supportPhone, setSupportPhone] = useState(site?.supportPhone ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleAttraction(id: string) {
    setSelectedAttractionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function onSave() {
    const domains = parseDomains(domainsRaw);
    if (name.trim().length < 2 || slug.trim().length < 2) {
      setMessage({ ok: false, text: "Nome e slug são obrigatórios." });
      return;
    }
    if (domains.length === 0) {
      setMessage({ ok: false, text: "Informe ao menos um domínio." });
      return;
    }
    if (!contactEmail.includes("@")) {
      setMessage({ ok: false, text: "Informe um e-mail de contato válido." });
      return;
    }
    if (!fullCatalog && selectedAttractionIds.length === 0) {
      setMessage({
        ok: false,
        text: "Selecione atrações ou marque catálogo completo.",
      });
      return;
    }

    const rgbOk = [brand, brandFg, brandMuted].every((v) =>
      /^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/.test(v.trim()),
    );
    if (!rgbOk) {
      setMessage({
        ok: false,
        text: 'Cores devem estar no formato "R G B" (ex.: 13 26 38).',
      });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const id = await saveSite({
        id: site?.id,
        name: name.trim(),
        slug: slug.trim(),
        domains,
        theme: {
          brand: brand.trim(),
          brandFg: brandFg.trim(),
          brandMuted: brandMuted.trim(),
          logoUrl: logoUrl.trim(),
          faviconUrl: faviconUrl.trim() || undefined,
        },
        attractionIds: fullCatalog ? null : selectedAttractionIds,
        partnerId: partnerId || null,
        status,
        contactEmail: contactEmail.trim().toLowerCase(),
        supportPhone: supportPhone.trim() || undefined,
      });
      setMessage({ ok: true, text: "Site salvo." });
      if (!site) {
        router.replace(`/admin/sites/editor?id=${id}`);
      }
    } catch (err) {
      setMessage({
        ok: false,
        text:
          err instanceof Error
            ? err.message
            : "Erro ao salvar (apenas admin pode editar sites).",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Identidade</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField label="Nome" value={name} onChange={onNameChange} />
            <TextField
              label="Slug"
              value={slug}
              onChange={(v) => {
                setSlugTouched(true);
                setSlug(v);
              }}
            />
            <TextField
              label="E-mail de contato"
              value={contactEmail}
              onChange={setContactEmail}
              type="email"
            />
            <TextField
              label="Telefone de suporte"
              value={supportPhone}
              onChange={setSupportPhone}
            />
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink">
                Domínios (um por linha ou separados por vírgula)
              </span>
              <textarea
                value={domainsRaw}
                onChange={(e) => setDomainsRaw(e.target.value)}
                rows={3}
                placeholder={"onerio.com\nwww.onerio.com\nlocalhost"}
                className="mt-1.5 w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink">Parceiro vinculado</span>
              <select
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
              >
                <option value="">Nenhum (site principal)</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Tema / branding</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Cores em RGB separado por espaço. OneRio: Noite Fresca{" "}
            <code className="text-xs">0 8 95</code>, Luz do Dia{" "}
            <code className="text-xs">251 255 225</code>, Rota Quente{" "}
            <code className="text-xs">255 93 6</code>.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ColorField label="Brand" value={brand} onChange={setBrand} />
            <ColorField label="Brand FG" value={brandFg} onChange={setBrandFg} />
            <ColorField label="Brand muted" value={brandMuted} onChange={setBrandMuted} />
            <div className="sm:col-span-3 grid gap-4 sm:grid-cols-2">
              <TextField label="Logo URL" value={logoUrl} onChange={setLogoUrl} />
              <TextField label="Favicon URL" value={faviconUrl} onChange={setFaviconUrl} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Recorte de catálogo</h2>
          <label className="mt-4 flex items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={fullCatalog}
              onChange={(e) => setFullCatalog(e.target.checked)}
              className="h-4 w-4 rounded border-surface-border"
            />
            Catálogo completo (todas as atrações)
          </label>
          {!fullCatalog ? (
            <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-surface-border p-3">
              {attractions.length === 0 ? (
                <li className="text-sm text-ink-muted">Nenhuma atração cadastrada.</li>
              ) : (
                attractions.map((a) => (
                  <li key={a.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-subtle">
                      <input
                        type="checkbox"
                        checked={selectedAttractionIds.includes(a.id)}
                        onChange={() => toggleAttraction(a.id)}
                        className="h-4 w-4 rounded border-surface-border"
                      />
                      <span className="text-ink">{a.name}</span>
                      <span className="text-xs text-ink-subtle">{a.city}</span>
                    </label>
                  </li>
                ))
              )}
            </ul>
          ) : null}
        </Card>
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
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </label>
          <div className="mt-4 flex items-center gap-3">
            <span
              className="h-10 w-10 rounded-xl border border-surface-border"
              style={{ backgroundColor: `rgb(${brand})` }}
              title="Preview brand"
            />
            <span
              className="h-10 w-10 rounded-xl border border-surface-border"
              style={{ backgroundColor: `rgb(${brandMuted})` }}
              title="Preview muted"
            />
          </div>
          <Button className="mt-5 w-full" disabled={busy} onClick={() => void onSave()}>
            {busy ? "Salvando…" : "Salvar site"}
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
          <p className="mt-3 text-xs text-ink-subtle">
            Somente usuários com papel admin podem gravar sites.
          </p>
        </Card>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}

function ColorField({
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
      <div className="mt-1.5 flex items-center gap-2">
        <span
          className="h-11 w-11 shrink-0 rounded-xl border border-surface-border"
          style={{ backgroundColor: `rgb(${value})` }}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="13 26 38"
          className="h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>
    </label>
  );
}
