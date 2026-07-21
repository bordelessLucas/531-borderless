"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { TicketType } from "@/features/attractions/types";
import type { FulfillmentStrategy } from "@/features/partners/types";
import {
  deleteTicketType,
  saveTicketType,
} from "@/features/attractions/staff-writes";
import { formatMoney } from "@/features/shared/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TicketTypesEditorProps {
  attractionId: string;
  initial: TicketType[];
}

const emptyForm = {
  name: "",
  description: "",
  priceReais: "",
  strategy: "" as "" | FulfillmentStrategy,
  partnerSkuCode: "",
  maxPerOrder: "10",
  isActive: true,
};

export function TicketTypesEditor({ attractionId, initial }: TicketTypesEditorProps) {
  const [items, setItems] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function startCreate() {
    setEditingId("new");
    setForm(emptyForm);
  }

  function startEdit(tt: TicketType) {
    setEditingId(tt.id);
    setForm({
      name: tt.name,
      description: tt.description ?? "",
      priceReais: (tt.price.amount / 100).toFixed(2),
      strategy: tt.strategy ?? "",
      partnerSkuCode: tt.partnerSkuCode ?? "",
      maxPerOrder: String(tt.maxPerOrder),
      isActive: tt.isActive,
    });
  }

  async function onSave() {
    const priceAmount = Math.round(Number(form.priceReais.replace(",", ".")) * 100);
    if (!form.name || Number.isNaN(priceAmount) || priceAmount < 0) {
      setMessage("Nome e preço válidos são obrigatórios.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const id = await saveTicketType({
        id: editingId === "new" ? undefined : editingId ?? undefined,
        attractionId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        priceAmount,
        strategy: form.strategy || null,
        partnerSkuCode: form.partnerSkuCode.trim() || undefined,
        maxPerOrder: Number(form.maxPerOrder) || 10,
        isActive: form.isActive,
      });

      const next: TicketType = {
        id,
        attractionId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: { amount: priceAmount, currency: "BRL" },
        strategy: form.strategy || null,
        partnerSkuCode: form.partnerSkuCode.trim() || undefined,
        maxPerOrder: Number(form.maxPerOrder) || 10,
        isActive: form.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setItems((prev) => {
        const without = prev.filter((t) => t.id !== id);
        return [...without, next].sort((a, b) => a.name.localeCompare(b.name));
      });
      setEditingId(null);
      setMessage("Categoria salva.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Remover esta categoria?")) return;
    setBusy(true);
    try {
      await deleteTicketType(id);
      setItems((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao remover.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Categorias (TicketType)</h2>
          <p className="text-sm text-ink-muted">Preço, SKU do parceiro e estratégia de emissão.</p>
        </div>
        <Button type="button" size="sm" onClick={startCreate} disabled={!!editingId}>
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </div>

      <ul className="mt-4 divide-y divide-surface-border">
        {items.map((tt) => (
          <li key={tt.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-medium text-ink">
                {tt.name}{" "}
                {!tt.isActive ? (
                  <span className="text-xs text-ink-subtle">(inativa)</span>
                ) : null}
              </p>
              <p className="text-xs text-ink-subtle">
                {formatMoney(tt.price)} · {tt.strategy ?? "herda parceiro"}
                {tt.partnerSkuCode ? ` · SKU ${tt.partnerSkuCode}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => startEdit(tt)}>
                Editar
              </Button>
              <button
                type="button"
                className="text-ink-subtle hover:text-red-600"
                onClick={() => void onDelete(tt.id)}
                aria-label={`Remover ${tt.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="py-4 text-sm text-ink-subtle">Nenhuma categoria cadastrada.</li>
        ) : null}
      </ul>

      {editingId ? (
        <div className="mt-4 grid gap-3 rounded-xl border border-surface-border p-4 sm:grid-cols-2">
          <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field
            label="Preço (R$)"
            value={form.priceReais}
            onChange={(v) => setForm({ ...form, priceReais: v })}
          />
          <div className="sm:col-span-2">
            <Field
              label="Descrição"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
            />
          </div>
          <label className="block">
            <span className="text-sm font-medium text-ink">Estratégia</span>
            <select
              value={form.strategy}
              onChange={(e) =>
                setForm({ ...form, strategy: e.target.value as "" | FulfillmentStrategy })
              }
              className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
            >
              <option value="">Herda do parceiro</option>
              <option value="MANUAL">Manual</option>
              <option value="API">API</option>
            </select>
          </label>
          <Field
            label="SKU parceiro"
            value={form.partnerSkuCode}
            onChange={(v) => setForm({ ...form, partnerSkuCode: v })}
          />
          <Field
            label="Máx. por pedido"
            value={form.maxPerOrder}
            onChange={(v) => setForm({ ...form, maxPerOrder: v })}
          />
          <label className="flex items-center gap-2 pt-6 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Ativa
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="button" disabled={busy} onClick={() => void onSave()}>
              {busy ? "Salvando…" : "Salvar categoria"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-3 text-xs text-ink-muted">{message}</p> : null}
    </Card>
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
        className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}
