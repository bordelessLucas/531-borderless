import type { Fulfillment, TicketAsset } from "@/features/fulfillment/types";
import type { AvailabilityMode } from "@/features/attractions/types";

/**
 * Contrato único para todo parceiro. Integração via API e emissão manual são
 * apenas implementações diferentes deste contrato (padrão Adapter + Strategy).
 * Adicionar um parceiro novo = criar um arquivo novo; o core não muda.
 */
export interface AvailabilityQuery {
  attractionId: string;
  ticketTypeId: string;
  date: string; // ISO date
}

export interface AvailabilityResult {
  mode: AvailabilityMode;
  available: boolean;
  slots: { start: string; remaining: number }[];
}

export interface IssueRequest {
  fulfillment: Fulfillment;
}

export type IssueResult =
  | { ok: true; assets: TicketAsset[]; externalReference?: string }
  | { ok: false; error: string; retryable: boolean };

export interface PartnerAdapter {
  readonly key: string;
  /** API real consulta o parceiro; manual devolve o calendário interno. */
  checkAvailability(query: AvailabilityQuery): Promise<AvailabilityResult>;
  /**
   * API emite automaticamente; manual devolve `queued` para cair na fila do
   * backoffice (o bilhete é anexado por um operador humano depois).
   */
  issueTickets(request: IssueRequest): Promise<IssueResult | { ok: "queued" }>;
  cancel(externalReference: string): Promise<{ ok: boolean; error?: string }>;
}
