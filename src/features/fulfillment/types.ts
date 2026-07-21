import type { ID, Timestamps } from "@/features/shared/types";
import type { FulfillmentStrategy } from "@/features/partners/types";

/**
 * Ciclo de vida de uma emissão. Cada atração a ser emitida em um pedido tem seu
 * próprio Fulfillment, permitindo que itens API e MANUAL avancem em paralelo.
 */
export type FulfillmentStatus =
  | "PENDING" // aguardando processamento
  | "PROCESSING" // API chamada / operador atuando
  | "ISSUED" // bilhete gerado
  | "DELIVERED" // enviado ao cliente
  | "FAILED" // erro (API ou manual)
  | "CANCELLED";

export interface TicketAsset {
  id: ID;
  /** URL no Storage (PDF/imagem) ou dado do QR. */
  url: string;
  fileName: string;
  /** Código de barras/QR textual, quando aplicável. */
  code?: string;
}

/**
 * Snapshot dos dados que o operador precisa para emitir no portal do parceiro
 * (modelo "dropshipping"): evita recomputar e garante rastreabilidade.
 */
export interface FulfillmentSnapshot {
  attractionName: string;
  partnerName: string;
  ticketTypeName: string;
  quantity: number;
  visitDate: string | null; // ISO date
  visitSlot: string | null; // "HH:mm"
  customerName: string;
  customerEmail: string;
  customerDocument?: string;
}

export interface Fulfillment extends Timestamps {
  id: ID;
  orderId: ID;
  orderItemId: ID;
  siteId: ID;
  /** Dono do pedido — permite create no batch sem get() do order. */
  customerUid?: string;
  partnerId: ID;
  attractionId: ID;
  ticketTypeId: ID;
  strategy: FulfillmentStrategy;
  status: FulfillmentStatus;
  snapshot: FulfillmentSnapshot;
  ticketAssets: TicketAsset[];
  /** Referência externa retornada pela API do parceiro. */
  externalReference?: string;
  /** Log de erro na última tentativa (API ou observação manual). */
  lastError?: string;
  /** Operador que concluiu a emissão manual. */
  handledByUid?: string;
}
