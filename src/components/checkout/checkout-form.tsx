"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CreditCard, Loader2, QrCode } from "lucide-react";
import { formatMoney, money, type Money } from "@/features/shared/types";
import type { Product } from "@/features/catalog/types";
import {
  placeOrder,
  type CheckoutTicketLine,
} from "@/features/orders/place-order";
import { useAuth } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CheckoutLine {
  label: string;
  detail: string;
  quantity: number;
  unitPrice: Money;
  ticketTypeId?: string;
}

type Method = "PIX" | "CREDIT_CARD";

interface CheckoutFormProps {
  lines: CheckoutLine[];
  total: Money;
  siteId: string;
  product: Product;
  visitDate: string | null;
  visitSlot: string | null;
}

export function CheckoutForm({
  lines,
  total,
  siteId,
  product,
  visitDate,
  visitSlot,
}: CheckoutFormProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [method, setMethod] = useState<Method>("PIX");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ orderId: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", document: "" });

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.displayName || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  const valid = form.name && form.email.includes("@") && form.phone.length >= 8;

  async function onSubmit() {
    if (!user) {
      setError("Faça login para finalizar a compra.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ticketLines: CheckoutTicketLine[] = lines.map((l) => ({
        ticketTypeId: l.ticketTypeId ?? "",
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        label: l.label,
      }));

      const placed = await placeOrder({
        customerUid: user.uid,
        siteId,
        product,
        customer: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          document: form.document.trim() || undefined,
        },
        paymentMethod: method,
        ticketLines,
        visitDate,
        visitSlot,
        passportQuantity: product.type === "PASSPORT" ? lines[0]?.quantity : undefined,
      });
      setResult({ orderId: placed.orderId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Card className="p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink">Pedido recebido!</h2>
        <p className="mt-2 text-ink-muted">
          Pedido <strong className="font-mono text-ink">{result.orderId.slice(0, 8)}</strong> criado.
          Confirmação enviada para <strong>{form.email}</strong>.
        </p>
        <p className="mx-auto mt-4 max-w-md rounded-xl bg-surface-subtle p-3 text-xs text-ink-subtle">
          Pagamento mock (sem gateway). Os bilhetes ficam disponíveis em Minha conta assim que a
          emissão for concluída.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={`/conta/pedidos/${result.orderId}`}>
            <Button>Ver pedido</Button>
          </Link>
          <Link href="/conta/pedidos">
            <Button variant="outline">Meus pedidos</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {!authLoading && !user ? (
          <Card className="border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-medium">Entre na sua conta para finalizar</p>
            <p className="mt-1 text-amber-800/80">
              Assim o pedido aparece em Minha conta e você recebe os bilhetes.
            </p>
            <div className="mt-3 flex gap-3">
              <Link href="/login">
                <Button size="sm">Entrar</Button>
              </Link>
              <Link href="/registro">
                <Button size="sm" variant="outline">
                  Criar conta
                </Button>
              </Link>
            </div>
          </Card>
        ) : null}

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
          {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
          <Button
            className="mt-5 w-full"
            size="lg"
            disabled={!valid || submitting || !user}
            onClick={() => void onSubmit()}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando…
              </>
            ) : (
              "Finalizar compra"
            )}
          </Button>
        </Card>
      </aside>
    </div>
  );
}

function Field({
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
        className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}

function MethodOption({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof QrCode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
        active ? "border-brand bg-brand/5" : "border-surface-border hover:border-brand",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          active ? "bg-brand text-brand-fg" : "bg-surface-subtle text-ink-muted",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs text-ink-subtle">{desc}</p>
      </div>
    </button>
  );
}
