"use client";

import { useState } from "react";
import styles from "./CreditCardFields.module.css";

export type PaymentMethod = "PIX" | "CREDIT_CARD" | "APPLE_PAY" | "GOOGLE_PAY";

export interface CreditCardValues {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface CreditCardFieldsProps {
  value: CreditCardValues;
  onChange: (next: CreditCardValues) => void;
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  onPay?: () => void;
  paying?: boolean;
}

/** Código Pix de demonstração (não é cobrança real). */
const DEMO_PIX_CODE =
  "00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5925ONERIO EXPERIENCIAS LTDA6009SAO PAULO62070503***6304ABCD";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value: string): string {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Em demo, qualquer preenchimento (ou vazio) é aceito. */
export function isCreditCardComplete(_card: CreditCardValues): boolean {
  return true;
}

/** Mapeia carteiras digitais para o método aceito pelo pedido (demo). */
export function toOrderPaymentMethod(
  method: PaymentMethod,
): "PIX" | "CREDIT_CARD" {
  return method === "PIX" ? "PIX" : "CREDIT_CARD";
}

function separatorLabel(method: PaymentMethod): string {
  if (method === "PIX") return "pague com Pix";
  if (method === "APPLE_PAY") return "pague com Apple Pay";
  if (method === "GOOGLE_PAY") return "pague com Google Pay";
  return "ou pague com cartão";
}

export function CreditCardFields({
  value,
  onChange,
  method,
  onMethodChange,
  onPay,
  paying = false,
}: CreditCardFieldsProps) {
  const [copied, setCopied] = useState(false);

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(DEMO_PIX_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const payBtn = onPay ? (
    <button
      type="button"
      className={styles.purchaseBtn}
      disabled={paying}
      onClick={onPay}
    >
      {paying ? "Processando…" : "Pagar agora (demo)"}
    </button>
  ) : null;

  return (
    <div className={styles.modal}>
      <div className={styles.form}>
        <div className={styles.paymentOptions}>
          <button
            type="button"
            name="apple-pay"
            aria-label="Apple Pay"
            className={`${styles.optionBtn} ${method === "APPLE_PAY" ? styles.optionBtnActive : ""}`}
            onClick={() => onMethodChange("APPLE_PAY")}
          >
            <svg viewBox="0 0 512 210.2" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path
                className={styles.monoLogo}
                d="M93.6,27.1C87.6,34.2,78,39.8,68.4,39c-1.2-9.6,3.5-19.8,9-26.1c6-7.3,16.5-12.5,25-12.9  C103.4,10,99.5,19.8,93.6,27.1 M102.3,40.9c-13.9-0.8-25.8,7.9-32.4,7.9c-6.7,0-16.8-7.5-27.8-7.3c-14.3,0.2-27.6,8.3-34.9,21.2  c-15,25.8-3.9,64,10.6,85c7.1,10.4,15.6,21.8,26.8,21.4c10.6-0.4,14.8-6.9,27.6-6.9c12.9,0,16.6,6.9,27.8,6.7  c11.6-0.2,18.9-10.4,26-20.8c8.1-11.8,11.4-23.3,11.6-23.9c-0.2-0.2-22.4-8.7-22.6-34.3c-0.2-21.4,17.5-31.6,18.3-32.2  C123.3,42.9,107.7,41.3,102.3,40.9 M182.6,11.9v155.9h24.2v-53.3h33.5c30.6,0,52.1-21,52.1-51.4c0-30.4-21.1-51.2-51.3-51.2H182.6z   M206.8,32.3h27.9c21,0,33,11.2,33,30.9c0,19.7-12,31-33.1,31h-27.8V32.3z M336.6,169c15.2,0,29.3-7.7,35.7-19.9h0.5v18.7h22.4V90.2  c0-22.5-18-37-45.7-37c-25.7,0-44.7,14.7-45.4,34.9h21.8c1.8-9.6,10.7-15.9,22.9-15.9c14.8,0,23.1,6.9,23.1,19.6v8.6l-30.2,1.8  c-28.1,1.7-43.3,13.2-43.3,33.2C298.4,155.6,314.1,169,336.6,169z M343.1,150.5c-12.9,0-21.1-6.2-21.1-15.7c0-9.8,7.9-15.5,23-16.4  l26.9-1.7v8.8C371.9,140.1,359.5,150.5,343.1,150.5z M425.1,210.2c23.6,0,34.7-9,44.4-36.3L512,54.7h-24.6l-28.5,92.1h-0.5  l-28.5-92.1h-25.3l41,113.5l-2.2,6.9c-3.7,11.7-9.7,16.2-20.4,16.2c-1.9,0-5.6-0.2-7.1-0.4v18.7C417.3,210,423.3,210.2,425.1,210.2z"
              />
            </svg>
          </button>

          <button
            type="button"
            name="google-pay"
            aria-label="Google Pay"
            className={`${styles.optionBtn} ${styles.googlePayBtn} ${method === "GOOGLE_PAY" ? styles.optionBtnActive : ""}`}
            onClick={() => onMethodChange("GOOGLE_PAY")}
          >
            <svg
              fill="none"
              viewBox="0 0 80 39"
              height="39"
              width="80"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <g clipPath="url(#gpay_clip)">
                <path
                  fill="#5F6368"
                  d="M37.8 19.7V29H34.8V6H42.6C44.5 6 46.3001 6.7 47.7001 8C49.1001 9.2 49.8 11 49.8 12.9C49.8 14.8 49.1001 16.5 47.7001 17.8C46.3001 19.1 44.6 19.8 42.6 19.8L37.8 19.7ZM37.8 8.8V16.8H42.8C43.9 16.8 45.0001 16.4 45.7001 15.6C47.3001 14.1 47.3 11.6 45.8 10.1L45.7001 10C44.9001 9.2 43.9 8.7 42.8 8.8H37.8Z"
                />
                <path
                  fill="#5F6368"
                  d="M56.7001 12.8C58.9001 12.8 60.6001 13.4 61.9001 14.6C63.2001 15.8 63.8 17.4 63.8 19.4V29H61V26.8H60.9001C59.7001 28.6 58 29.5 56 29.5C54.3 29.5 52.8 29 51.6 28C50.5 27 49.8 25.6 49.8 24.1C49.8 22.5 50.4 21.2 51.6 20.2C52.8 19.2 54.5 18.8 56.5 18.8C58.3 18.8 59.7 19.1 60.8 19.8V19.1C60.8 18.1 60.4 17.1 59.6 16.5C58.8 15.8 57.8001 15.4 56.7001 15.4C55.0001 15.4 53.7 16.1 52.8 17.5L50.2001 15.9C51.8001 13.8 53.9001 12.8 56.7001 12.8ZM52.9001 24.2C52.9001 25 53.3001 25.7 53.9001 26.1C54.6001 26.6 55.4001 26.9 56.2001 26.9C57.4001 26.9 58.6 26.4 59.5 25.5C60.5 24.6 61 23.5 61 22.3C60.1 21.6 58.8 21.2 57.1 21.2C55.9 21.2 54.9 21.5 54.1 22.1C53.3 22.6 52.9001 23.3 52.9001 24.2Z"
                />
                <path
                  fill="#5F6368"
                  d="M80 13.3L70.1 36H67.1L70.8 28.1L64.3 13.4H67.5L72.2 24.7H72.3L76.9 13.4H80V13.3Z"
                />
                <path
                  fill="#4285F4"
                  d="M25.9 17.7C25.9 16.8 25.8 15.9 25.7 15H13.2V20.1H20.3C20 21.7 19.1 23.2 17.7 24.1V27.4H22C24.5 25.1 25.9 21.7 25.9 17.7Z"
                />
                <path
                  fill="#34A853"
                  d="M13.1999 30.5999C16.7999 30.5999 19.7999 29.3999 21.9999 27.3999L17.6999 24.0999C16.4999 24.8999 14.9999 25.3999 13.1999 25.3999C9.7999 25.3999 6.7999 23.0999 5.7999 19.8999H1.3999V23.2999C3.6999 27.7999 8.1999 30.5999 13.1999 30.5999Z"
                />
                <path
                  fill="#FBBC04"
                  d="M5.8001 19.8999C5.2001 18.2999 5.2001 16.4999 5.8001 14.7999V11.3999H1.4001C-0.499902 15.0999 -0.499902 19.4999 1.4001 23.2999L5.8001 19.8999Z"
                />
                <path
                  fill="#EA4335"
                  d="M13.2 9.39996C15.1 9.39996 16.9 10.1 18.3 11.4L22.1 7.59996C19.7 5.39996 16.5 4.09996 13.3 4.19996C8.3 4.19996 3.7 6.99996 1.5 11.5L5.9 14.9C6.8 11.7 9.8 9.39996 13.2 9.39996Z"
                />
              </g>
              <defs>
                <clipPath id="gpay_clip">
                  <rect fill="white" height="38.1" width="80" />
                </clipPath>
              </defs>
            </svg>
          </button>

          <button
            type="button"
            name="pix"
            className={`${styles.optionBtn} ${method === "PIX" ? styles.optionBtnActive : ""}`}
            onClick={() => onMethodChange("PIX")}
          >
            <span className={styles.pixMark} aria-hidden>
              Pix
            </span>
            Pix
          </button>
        </div>

        <div className={styles.separator}>
          <hr className={styles.line} />
          <p>{separatorLabel(method)}</p>
          <hr className={styles.line} />
        </div>

        {method === "PIX" ? (
          <div className={styles.pixPanel}>
            <div className={styles.qrBox} aria-hidden>
              <div className={styles.qrInner}>Pix</div>
            </div>
            <p className={styles.pixTitle}>Escaneie o QR Code</p>
            <p className={styles.pixDesc}>
              Abra o app do seu banco, escolha Pix e escaneie o código. Aprovação
              imediata após o pagamento.
            </p>
            <div className={styles.pixCodeRow}>
              <input
                className={styles.pixCode}
                readOnly
                value={DEMO_PIX_CODE}
                aria-label="Código Pix copia e cola"
              />
              <button type="button" className={styles.copyBtn} onClick={() => void copyPix()}>
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className={styles.hint}>
              Simulação: qualquer código ou clique em pagar é aprovado.
            </p>
            {payBtn}
            <button
              type="button"
              className={styles.optionBtn}
              onClick={() => onMethodChange("CREDIT_CARD")}
            >
              Prefiro cartão
            </button>
          </div>
        ) : null}

        {method === "APPLE_PAY" ? (
          <div className={styles.walletPanel}>
            <p className={styles.walletTitle}>Apple Pay</p>
            <p className={styles.walletDesc}>
              Simulação de Apple Pay — toque em pagar e a cobrança é aprovada na hora
              (nenhum valor real).
            </p>
            {payBtn}
            <button
              type="button"
              className={styles.optionBtn}
              onClick={() => onMethodChange("CREDIT_CARD")}
            >
              Prefiro cartão
            </button>
          </div>
        ) : null}

        {method === "GOOGLE_PAY" ? (
          <div className={styles.walletPanel}>
            <p className={styles.walletTitle}>Google Pay</p>
            <p className={styles.walletDesc}>
              Simulação de Google Pay — toque em pagar e a cobrança é aprovada na hora
              (nenhum valor real).
            </p>
            {payBtn}
            <button
              type="button"
              className={styles.optionBtn}
              onClick={() => onMethodChange("CREDIT_CARD")}
            >
              Prefiro cartão
            </button>
          </div>
        ) : null}

        {method === "CREDIT_CARD" ? (
          <>
            <div className={styles.creditCardInfoForm}>
              <div className={styles.inputContainer}>
                <label htmlFor="cardHolderName" className={styles.inputLabel}>
                  Nome impresso no cartão
                </label>
                <input
                  id="cardHolderName"
                  className={styles.inputField}
                  type="text"
                  name="cardName"
                  autoComplete="cc-name"
                  placeholder="Qualquer nome (demo)"
                  value={value.cardName}
                  onChange={(e) => onChange({ ...value, cardName: e.target.value })}
                />
              </div>

              <div className={styles.inputContainer}>
                <label htmlFor="cardNumberField" className={styles.inputLabel}>
                  Número do cartão
                </label>
                <input
                  id="cardNumberField"
                  className={styles.inputField}
                  type="text"
                  inputMode="numeric"
                  name="cardNumber"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  value={value.cardNumber}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      cardNumber: formatCardNumber(e.target.value),
                    })
                  }
                />
              </div>

              <div className={styles.inputContainer}>
                <label htmlFor="cardExpiryField" className={styles.inputLabel}>
                  Validade / CVV
                </label>
                <div className={styles.split}>
                  <input
                    id="cardExpiryField"
                    className={styles.inputField}
                    type="text"
                    inputMode="numeric"
                    name="expiryDate"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    value={value.expiryDate}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        expiryDate: formatExpiry(e.target.value),
                      })
                    }
                  />
                  <input
                    id="cardCvvField"
                    className={styles.inputField}
                    type="password"
                    inputMode="numeric"
                    name="cvv"
                    autoComplete="cc-csc"
                    placeholder="CVV"
                    maxLength={4}
                    value={value.cvv}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        cvv: digitsOnly(e.target.value).slice(0, 4),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <p className={styles.hint}>
              Demo: campos opcionais. Qualquer valor (ou vazio) é aprovado.
            </p>
            {payBtn}
          </>
        ) : null}
      </div>
    </div>
  );
}
