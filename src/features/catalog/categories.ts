import type { Product } from "@/features/catalog/types";

export const PRODUCT_CATEGORY_LABELS: Record<
  NonNullable<Product["category"]>,
  string
> = {
  icone: "Ícones do Rio",
  familia: "Família & natureza",
  museu: "Museus & cultura",
  esporte: "Esporte",
  cinema: "Cinema",
  passaporte: "Passaportes",
};

export const ATTRACTION_CATEGORY_ORDER: NonNullable<Product["category"]>[] = [
  "icone",
  "familia",
  "museu",
  "esporte",
  "cinema",
];
