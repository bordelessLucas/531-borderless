/**
 * Primitivos compartilhados por todo o domínio.
 * Regra: valores monetários SEMPRE em centavos (inteiro) para evitar erro de ponto flutuante.
 */

export type ID = string;

export type Cents = number;

export interface Money {
  amount: Cents;
  currency: "BRL";
}

export interface Timestamps {
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface LocalizedImage {
  url: string;
  alt: string;
}

export type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export const money = (amount: Cents): Money => ({ amount, currency: "BRL" });

export const formatMoney = (value: Money): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: value.currency,
  }).format(value.amount / 100);
