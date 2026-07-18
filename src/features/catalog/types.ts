import type {
  ID,
  LocalizedImage,
  Money,
  PublishStatus,
  Timestamps,
} from "@/features/shared/types";
import type { ContentBlock } from "@/features/attractions/types";

export type ProductType = "SIMPLE" | "PASSPORT";

/**
 * Item que compõe um passaporte. Aponta para uma categoria de ingresso de uma
 * atração. É AQUI que mora a complexidade: cada item pode ter parceiro, regra e
 * forma de emissão diferentes — mas o cliente vê um produto só.
 */
export interface PassportItem {
  id: ID;
  attractionId: ID;
  ticketTypeId: ID;
  /** Quantidade desta atração inclusa por unidade de passaporte. */
  quantity: number;
  /** Item obrigatório ou opcional (cliente escolhe N de M). */
  required: boolean;
  /** Ordem de exibição/agendamento sugerida. */
  order: number;
}

export interface PassportComposition {
  items: PassportItem[];
  /**
   * Para passaportes "escolha N de M": mínimo de itens opcionais a selecionar.
   * Ignorado quando todos os itens são obrigatórios.
   */
  minOptionalSelections?: number;
}

/**
 * Produto vendável na vitrine.
 * - SIMPLE: espelha 1 atração (as categorias vêm dos TicketTypes da atração).
 * - PASSPORT: produto composto com preço próprio e composição de atrações.
 */
export interface Product extends Timestamps {
  id: ID;
  type: ProductType;
  slug: string;
  name: string;
  tagline: string;
  heroImage: LocalizedImage;
  content: ContentBlock[];
  status: PublishStatus;
  /** SIMPLE aponta para uma atração; PASSPORT usa `composition`. */
  attractionId: ID | null;
  composition: PassportComposition | null;
  /** Preço "a partir de" exibido na vitrine (calculado/curado). */
  fromPrice: Money;
  /** Preço fechado do passaporte (SIMPLE deriva dos ticket types). */
  passportPrice: Money | null;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
}
