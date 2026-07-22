"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import type { FulfillmentStrategy, Partner } from "@/features/partners/types";
import { savePartner } from "@/features/partners/staff-writes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ADAPTER_OPTIONS = [
  { value: "manual", label: "Manual (fila do backoffice)" },
  { value: "generic-rest", label: "Generic REST (API)" },
] as const;

interface PartnerEditorProps {
  partner: Partner | null;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PartnerEditor({ partner }: PartnerEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(partner?.name ?? "");
  const [slug, setSlug] = useState(partner?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(partner));
  const [defaultStrategy, setDefaultStrategy] = useState<FulfillmentStrategy>(
    partner?.defaultStrategy ?? "MANUAL",
  );
  const [adapterKey, setAdapterKey] = useState(
    partner?.integration?.adapterKey ?? "manual",
  );
  const [configRows, setConfigRows] = useState<Array<{ key: string; value: string }>>(
    () => {
      const entries = Object.entries(partner?.integration?.config ?? {});
      return entries.length > 0
        ? entries.map(([key, value]) => ({ key, value }))
        : [{ key: "baseUrl", value: "" }];
    },
  );
  const [commissionPercent, setCommissionPercent] = useState(
    ((partner?.commissionBps ?? 1000) / 100).toString(),
  );
  const [contactEmail, setContactEmail] = useState(partner?.contactEmail ?? "");
  const [isActive, setIsActive] = useState(partner?.isActive ?? true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const needsIntegration = defaultStrategy === "API" || adapterKey !== "manual";

  const previewCommissionBps = useMemo(() => {
    const pct = Number(commissionPercent.replace(",", "."));
    if (Number.isNaN(pct) || pct < 0) return null;
    return Math.round(pct * 100);
  }, [commissionPercent]);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSave() {
    const commissionBps = previewCommissionBps;
    if (name.trim().length < 2 || slug.trim().length < 2) {
      setMessage({ ok: false, text: "Nome e slug são obrigatórios." });
      return;
    }
    if (!contactEmail.includes("@")) {
      setMessage({ ok: false, text: "Informe um e-mail de contato válido." });
      return;
    }
    if (commissionBps === null) {
      setMessage({ ok: false, text: "Comissão inválida." });
      return;
    }

    const config: Record<string, string> = {};
    for (const row of configRows) {
      const key = row.key.trim();
      if (!key) continue;
      config[key] = row.value.trim();
    }

    const integration =
      needsIntegration || Object.keys(config).length > 0
        ? { adapterKey, config }
        : adapterKey === "manual"
          ? { adapterKey: "manual", config: {} }
          : null;

    setBusy(true);
    setMessage(null);
    try {
      const id = await savePartner({
        id: partner?.id,
        name: name.trim(),
        slug: slug.trim(),
        defaultStrategy,
        integration,
        commissionBps,
        contactEmail: contactEmail.trim().toLowerCase(),
        isActive,
      });
      setMessage({ ok: true, text: "Parceiro salvo." });
      if (!partner) {
        router.replace(`/admin/parceiros/${id}`);
        router.refresh();
      }
    } catch (err) {
      setMessage({
        ok: false,
        text:
          err instanceof Error
            ? err.message
            : "Erro ao salvar (apenas admin pode editar parceiros).",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Dados do parceiro</h2>
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
              label="Comissão OneRio (%)"
              value={commissionPercent}
              onChange={setCommissionPercent}
              hint={
                previewCommissionBps !== null
                  ? `${previewCommissionBps} basis points`
                  : undefined
              }
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Integração</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Estratégia padrão das atrações deste parceiro e adapter de emissão.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-ink">Emissão padrão</span>
              <select
                value={defaultStrategy}
                onChange={(e) => {
                  const next = e.target.value as FulfillmentStrategy;
                  setDefaultStrategy(next);
                  if (next === "MANUAL") setAdapterKey("manual");
                  if (next === "API" && adapterKey === "manual") {
                    setAdapterKey("generic-rest");
                  }
                }}
                className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
              >
                <option value="MANUAL">Manual (fila)</option>
                <option value="API">API (automática)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Adapter</span>
              <select
                value={adapterKey}
                onChange={(e) => setAdapterKey(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
              >
                {ADAPTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-ink">Config do adapter</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfigRows((rows) => [...rows, { key: "", value: "" }])}
              >
                <Plus className="h-4 w-4" /> Campo
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {configRows.map((row, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={row.key}
                    placeholder="chave (ex.: baseUrl)"
                    onChange={(e) =>
                      setConfigRows((rows) =>
                        rows.map((r, i) =>
                          i === index ? { ...r, key: e.target.value } : r,
                        ),
                      )
                    }
                    className="h-11 w-1/3 rounded-xl border border-surface-border bg-surface px-3 text-sm"
                  />
                  <input
                    value={row.value}
                    placeholder="valor"
                    onChange={(e) =>
                      setConfigRows((rows) =>
                        rows.map((r, i) =>
                          i === index ? { ...r, value: e.target.value } : r,
                        ),
                      )
                    }
                    className="h-11 flex-1 rounded-xl border border-surface-border bg-surface px-3 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Remover campo"
                    onClick={() =>
                      setConfigRows((rows) => rows.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-subtle">
              Credenciais sensíveis devem ir em variáveis de ambiente; aqui só referências
              (ex.: secretId, baseUrl).
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Status</h2>
          <label className="mt-4 flex items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-surface-border"
            />
            Parceiro ativo
          </label>
          <Button className="mt-5 w-full" disabled={busy} onClick={() => void onSave()}>
            {busy ? "Salvando…" : "Salvar parceiro"}
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
            Somente usuários com papel admin podem gravar parceiros.
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
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
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
      {hint ? <p className="mt-1 text-xs text-ink-subtle">{hint}</p> : null}
    </label>
  );
}
