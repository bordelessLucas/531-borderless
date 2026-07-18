import type { ID, Timestamps } from "@/features/shared/types";

/**
 * Estratégia de emissão do bilhete. É o eixo que separa os 3 modelos do briefing:
 * - API: emissão automática via integração com o parceiro.
 * - MANUAL: "dropshipping de ingressos" — cai na fila do backoffice.
 */
export type FulfillmentStrategy = "API" | "MANUAL";

/**
 * Configuração de integração de um parceiro. O `adapterKey` seleciona a
 * implementação concreta de PartnerAdapter (padrão adapter / Open-Closed).
 */
export interface PartnerIntegration {
  adapterKey: string; // ex.: "sympla", "generic-rest", "manual"
  /** Config específica do adapter (endpoint, credenciais referenciadas por id, etc.). */
  config: Record<string, string>;
}

export interface Partner extends Timestamps {
  id: ID;
  name: string;
  slug: string;
  defaultStrategy: FulfillmentStrategy;
  integration: PartnerIntegration | null;
  /** Regra de repasse financeiro (comissão da OneRio em basis points: 1000 = 10%). */
  commissionBps: number;
  contactEmail: string;
  isActive: boolean;
}
