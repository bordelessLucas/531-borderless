import type {
  AvailabilityQuery,
  AvailabilityResult,
  IssueRequest,
  PartnerAdapter,
} from "@/features/fulfillment/adapters/types";

/**
 * Adapter para atrativos SEM integração (modelo dropshipping).
 * A disponibilidade vem do calendário interno da atração (resolvido a montante)
 * e a emissão é enfileirada para o backoffice — nunca chama parceiro externo.
 */
export class ManualAdapter implements PartnerAdapter {
  readonly key = "manual";

  async checkAvailability(_query: AvailabilityQuery): Promise<AvailabilityResult> {
    // Disponibilidade manual é resolvida pelo motor interno de calendário.
    // O adapter só confirma o modo; a checagem real acontece no availability engine.
    return { mode: "DATED", available: true, slots: [] };
  }

  async issueTickets(_request: IssueRequest): Promise<{ ok: "queued" }> {
    // Cai na fila do backoffice: o operador emite no portal do parceiro e anexa.
    return { ok: "queued" };
  }

  async cancel(_externalReference: string): Promise<{ ok: boolean }> {
    return { ok: true };
  }
}
