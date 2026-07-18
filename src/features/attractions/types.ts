import type {
  ID,
  LocalizedImage,
  Money,
  PublishStatus,
  Timestamps,
} from "@/features/shared/types";
import type { FulfillmentStrategy } from "@/features/partners/types";

/**
 * Como a atração lida com data/horário:
 * - SCHEDULED: data e horário marcados (sessões).
 * - DATED: data livre escolhida pelo cliente, sem horário.
 * - OPEN: sem data (voucher com validade, usar quando quiser).
 */
export type AvailabilityMode = "SCHEDULED" | "DATED" | "OPEN";

export interface TimeSlot {
  /** "HH:mm" 24h. */
  start: string;
  capacity: number;
}

export interface SeasonRule {
  id: ID;
  label: string;
  /** Intervalo em ISO date "YYYY-MM-DD". */
  from: string;
  to: string;
  /** Sobrescreve horários padrão nesta temporada, se definido. */
  slots?: TimeSlot[];
  /** Ajuste de preço em basis points aplicado às categorias (ex.: 1500 = +15%). */
  priceAdjustmentBps?: number;
}

/**
 * Política de disponibilidade da atração: calendário, bloqueios e temporadas.
 * O motor de disponibilidade consome isto para dizer se uma data é vendável.
 */
export interface AvailabilityPolicy {
  mode: AvailabilityMode;
  /** Dias da semana operáveis (0=domingo ... 6=sábado). Vazio = todos. */
  weekdays: number[];
  /** Slots padrão (apenas para mode SCHEDULED). */
  defaultSlots: TimeSlot[];
  /** Datas bloqueadas (feriados, manutenção) em ISO "YYYY-MM-DD". */
  blackoutDates: string[];
  seasons: SeasonRule[];
  /** Antecedência mínima de compra em horas. */
  leadTimeHours: number;
  /** Validade do voucher em dias após a compra (para mode OPEN). */
  validityDays?: number;
}

export interface TicketType extends Timestamps {
  id: ID;
  attractionId: ID;
  name: string; // ex.: "Inteira", "Meia", "Criança (3-11)"
  description?: string;
  price: Money;
  /** Estratégia de emissão específica; herda a do parceiro se ausente. */
  strategy: FulfillmentStrategy | null;
  /** Código/categoria no sistema do parceiro (usado pelo adapter de API). */
  partnerSkuCode?: string;
  maxPerOrder: number;
  isActive: boolean;
}

export interface Attraction extends Timestamps {
  id: ID;
  partnerId: ID;
  slug: string;
  name: string;
  shortDescription: string;
  /** Conteúdo rico (CMS) em blocos. */
  content: ContentBlock[];
  city: string;
  heroImage: LocalizedImage;
  gallery: LocalizedImage[];
  highlights: string[];
  usageRules: string[];
  availability: AvailabilityPolicy;
  status: PublishStatus;
  /** SEO */
  metaTitle?: string;
  metaDescription?: string;
}

/** Bloco de conteúdo do CMS estruturado (mantém edição fácil sem dev). */
export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "image"; image: LocalizedImage }
  | { type: "faq"; items: { question: string; answer: string }[] };
