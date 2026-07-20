/** Nomes de coleções do Firestore em um único lugar (evita strings mágicas). */
export const COLLECTIONS = {
  sites: "sites",
  partners: "partners",
  attractions: "attractions",
  ticketTypes: "ticketTypes",
  products: "products",
  orders: "orders",
  fulfillments: "fulfillments",
  users: "users",
  config: "config",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
