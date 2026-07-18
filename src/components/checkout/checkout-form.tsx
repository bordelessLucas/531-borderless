"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, QrCode } from "lucide-react";
import { formatMoney, money, type Money } from "@/features/shared/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CheckoutLine {
  label: string;
  detail: string;
  quantity: number;
  unitPrice: Money;
}

type Method = "PIX" | "CREDIT_CARD";

export function CheckoutForm({ lines, total }: { lines: CheckoutLine[]; total: Money }) {
  const [method, setMethod] = useState<Method>("PIX");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", document: "" });

  const valid = form.name && form.email.includes("@") && form.phone.length >= 8;

  if (done) {
    return (
      <Card className="p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">Pedido recebido!</h2>
        <p className="mt-2 text-ink-muted">
          Enviamos a confirmação para <strong>{form.email}</strong>. Os bilhetes chegam por e-mail
          assim que cada emissão for concluída.
        </p>
        <p className="mx-auto mt-4 max-w-md rounded-xl bg-surface-subtle p-3 text-xs text-ink-subtle">
          Protótipo: nenhum pagamento real foi processado. O gateway (PIX/cartão) será plugado via
          interface na fase de pagamento.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Seus dados</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="CPF (opcional)" value={form.document} onChange={(v) => setForm({ ...form, document: v })} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Pagamento</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <MethodOption active={method === "PIX"} onClick={() => setMethod("PIX")} icon={QrCode} title="Pix" desc="Aprovação imediata" />
            <MethodOption active={method === "CREDIT_CARD"} onClick={() => setMethod("CREDIT_CARD")} icon={CreditCard} title="Cartão de crédito" desc="Em até 12x" />
          </div>
        </Card>
      </div>

      <aside>
        <Card className="sticky top-24 p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Resumo</h2>
          <ul className="mt-4 space-y-3">
            {lines.map((line, i) => (
              <li key={i} className="flex justify-between gap-4 text-sm">
                <span className="text-ink-muted">
                  {line.quantity}× {line.label}
                  <span className="block text-xs text-ink-subtle">{line.detail}</span>
                </span>
                <span className="font-medium text-ink">
                  {formatMoney(money(line.quantity * line.unitPrice.amount))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-surface-border pt-4">
            <span className="text-sm text-ink-muted">Total</span>
            <span className="font-display text-2xl font-semibold text-ink">{formatMoney(total)}</span>
          </div>
          <Button className="mt-5 w-full" size="lg" disabled={!valid} onClick={() => setDone(true)}>
            Finalizar compra
          </Button>
        </Card>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}

function MethodOption({ active, onClick, icon: Icon, title, desc }: { active: boolean; onClick: () => void; icon: typeof QrCode; title: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
        active ? "border-brand bg-brand/5" : "border-surface-border hover:border-brand",
      )}
    >
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", active ? "bg-brand text-brand-fg" : "bg-surface-subtle text-ink-muted")}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-ink-subtle">{desc}</p>
      </div>
    </button>
  );
}
