import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import type { PaymentMethod } from "@/components/checkout/CreditCardFields";
import styles from "./PaymentSuccess.module.css";

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

interface PaymentSuccessProps {
  orderId: string;
  method: PaymentMethod;
}

export function PaymentSuccess({ orderId, method }: PaymentSuccessProps) {
  return (
    <Card className="overflow-hidden border-surface-border bg-surface shadow-card">
      <div className={styles.wrap}>
        <div className={styles.iconStage} aria-hidden>
          <span className={styles.ring} />
          <span className={styles.badge}>
            <svg className={styles.check} viewBox="0 0 24 24">
              <path className={styles.checkPath} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </div>

        <h2 className={styles.title}>Pagamento aprovado</h2>
        <p className={styles.body}>
          Simulação via <span className={styles.strong}>{paymentLabel(method)}</span>{" "}
          concluída. Pedido{" "}
          <span className={styles.mono}>{orderId.slice(0, 8)}</span>.{" "}
          {ONERIO_VOICE.checkout.successBody}
        </p>

        <p className={styles.note}>
          Ambiente de demonstração: qualquer dado ou método é aceito. Nenhum valor
          real foi cobrado.
        </p>

        <div className={styles.actions}>
          <Link href={`/conta/pedidos/${orderId}`}>
            <Button>{ONERIO_VOICE.cta.viewOrder}</Button>
          </Link>
          <Link href="/conta/pedidos">
            <Button variant="outline">Meus pedidos</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
