import type { ID, Money, Timestamps } from "@/features/shared/types";
import type { ProductType } from "@/features/catalog/types";

export type OrderStatus =
  | "CART"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "PROCESSING" // pago; emitindo fulfillments
  | "COMPLETED" // todos os fulfillments entregues
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface Customer {
  name: string;
  email: string;
  phone: string;
  document?: string; // CPF
}

/**
 * Linha do pedido = 1 produto comprado (SIMPLE ou PASSPORT).
 * As emissões concretas vivem em Fulfillments separados, referenciados por id.
 */
export interface OrderItem {
  id: ID;
  productId: ID;
  productType: ProductType;
  productName: string;
  quantity: number;
  unitPrice: Money;
  /** Data/horário escolhidos (quando aplicável ao produto simples). */
  visitDate: string | null;
  visitSlot: string | null;
  /** Ids dos Fulfillments gerados a partir deste item. */
  fulfillmentIds: ID[];
}

/**
 * Referência de pagamento desacoplada do gateway (Stripe/Pagar.me/MP).
 * O gateway concreto é escolhido depois; aqui só guardamos o essencial.
 */
export interface PaymentRef {
  provider: string; // "pending" enquanto não definido
  status: PaymentStatus;
  externalId?: string;
  method?: "PIX" | "CREDIT_CARD" | "BOLETO";
}

export interface Order extends Timestamps {
  id: ID;
  siteId: ID;
  /** Firebase Auth uid do comprador (obrigatório para área /conta). */
  customerUid?: string;
  status: OrderStatus;
  customer: Customer;
  items: OrderItem[];
  subtotal: Money;
  discount: Money;
  total: Money;
  payment: PaymentRef;
  /** Facilita a fila do backoffice: true se há qualquer emissão manual pendente. */
  hasManualFulfillment: boolean;
  notes?: string;
}
