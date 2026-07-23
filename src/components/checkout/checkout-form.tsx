"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatMoney, money, type Money } from "@/features/shared/types";
import type { Product } from "@/features/catalog/types";
import {
  placeOrder,
  type CheckoutTicketLine,
} from "@/features/orders/place-order";
import { useAuth } from "@/features/auth/auth-provider";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CreditCardFields,
  toOrderPaymentMethod,
  type CreditCardValues,
  type PaymentMethod,
} from "@/components/checkout/CreditCardFields";
import { PaymentSuccess } from "@/components/checkout/PaymentSuccess";

export interface CheckoutLine {
  label: string;
  detail: string;
  quantity: number;
  unitPrice: Money;
  ticketTypeId?: string;
}

interface CheckoutFormProps {
  lines: CheckoutLine[];
  total: Money;
  siteId: string;
  product: Product;
  visitDate: string | null;
  visitSlot: string | null;
}

function paymentLabel(method: PaymentMethod): string {
  switch (method) {
    case "PIX":
      return "Pix";
    case "APPLE_PAY":
      return "Apple Pay";
    case "GOOGLE_PAY":
      return "Google Pay";
    default:
      return "cartão";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
  const [method, setMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<"idle" | "paying" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ orderId: string; method: PaymentMethod } | null>(
    null,
  );
  const [form, setForm] = useState({ name: "", email: "", phone: "", document: "" });
  const [card, setCard] = useState<CreditCardValues>({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.displayName || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  async function onSubmit() {
    if (!user) {
      setError("Faça login para finalizar a compra.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Simulação mocada: qualquer método/dado é aprovado.
      setPhase("paying");
      await sleep(1400);

      setPhase("saving");
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
          name: form.name.trim() || user.displayName || "Cliente OneRio",
          email: (form.email.trim() || user.email || "cliente@onerio.demo").toLowerCase(),
          phone: form.phone.trim() || "21999999999",
          document: form.document.trim() || undefined,
        },
        paymentMethod: toOrderPaymentMethod(method),
        ticketLines,
        visitDate,
        visitSlot,
        passportQuantity: product.type === "PASSPORT" ? lines[0]?.quantity : undefined,
      });
      setResult({ orderId: placed.orderId, method });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o pedido.");
      setPhase("idle");
    } finally {
      setSubmitting(false);
      setPhase("idle");
    }
  }

  if (result) {
    return <PaymentSuccess orderId={result.orderId} method={result.method} />;
  }

  const submitLabel =
    phase === "paying"
      ? `Processando ${paymentLabel(method)}…`
      : phase === "saving"
        ? "Registrando pedido…"
        : `Pagar com ${paymentLabel(method)}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        {!authLoading && !user ? (
          <Card className="border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-medium">{ONERIO_VOICE.checkout.loginPromptTitle}</p>
            <p className="mt-1 text-amber-800/80">
              {ONERIO_VOICE.checkout.loginPromptBody}
            </p>
            <div className="mt-4 flex gap-3">
              <Link href="/login">
                <Button size="md">Entrar</Button>
              </Link>
              <Link href="/registro">
                <Button size="md" variant="outline">
                  Criar conta
                </Button>
              </Link>
            </div>
          </Card>
        ) : null}

        <Card className="border-surface-border bg-white p-7 md:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            Seus dados
          </h2>
          <p className="mt-1 text-sm text-ink-subtle">
            Demonstração: campos opcionais — qualquer valor (ou vazio) funciona.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Nome completo" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="CPF (opcional)" value={form.document} onChange={(v) => setForm({ ...form, document: v })} />
          </div>
        </Card>

        <Card className="border-surface-border bg-white p-7 md:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            Pagamento
          </h2>
          <p className="mt-1 text-sm text-ink-subtle">
            Simulação mocada: Pix, Apple Pay, Google Pay ou cartão — sempre aprovado.
          </p>
          <div className="mt-6 flex justify-center">
            <CreditCardFields
              value={card}
              onChange={setCard}
              method={method}
              onMethodChange={setMethod}
              onPay={() => void onSubmit()}
              paying={submitting}
            />
          </div>
        </Card>
      </div>

      <aside>
        <Card className="sticky top-24 border-surface-border bg-white p-7 shadow-float md:p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            Resumo
          </h2>
          <ul className="mt-5 space-y-4">
            {lines.map((line, i) => (
              <li key={i} className="flex justify-between gap-4 text-[15px]">
                <span className="text-ink-muted">
                  {line.quantity}× {line.label}
                  <span className="mt-0.5 block text-sm text-ink-subtle">{line.detail}</span>
                </span>
                <span className="font-semibold text-ink">
                  {formatMoney(money(line.quantity * line.unitPrice.amount))}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t border-surface-border pt-5">
            <span className="text-sm font-medium text-ink-muted">Total</span>
            <span className="font-display text-3xl font-semibold tracking-tight text-ink">
              {formatMoney(total)}
            </span>
          </div>
          {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
          <Button
            className="mt-6 w-full"
            size="lg"
            disabled={submitting || !user}
            onClick={() => void onSubmit()}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {submitLabel}
              </>
            ) : (
              submitLabel
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-ink-subtle">
            Nenhum gateway real. Pagamento sempre aprovado nesta demo.
          </p>
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
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-surface-border bg-surface-subtle px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15"
      />
    </label>
  );
}
