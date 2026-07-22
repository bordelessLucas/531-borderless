import type { Site } from "@/features/tenant/types";
import type { Fulfillment } from "@/features/fulfillment/types";
import type { Order } from "@/features/orders/types";
import { money } from "@/features/shared/types";
import {
  catalogPartners,
  catalogAttractions,
  catalogTicketTypes,
  catalogProducts,
  catalogTs,
} from "@/lib/seed/catalog-rio";

const ts = catalogTs;

export const seedPartners = catalogPartners;
export const seedAttractions = catalogAttractions;
export const seedTicketTypes = catalogTicketTypes;
export const seedProducts = catalogProducts;

export const seedFulfillments: Fulfillment[] = [
  {
    id: "ful-001",
    orderId: "ord-1042",
    orderItemId: "oi-1",
    siteId: "onerio",
    partnerId: "partner-aquario",
    attractionId: "attr-aquario",
    ticketTypeId: "tt-aquario-inteira",
    strategy: "MANUAL",
    status: "PENDING",
    snapshot: {
      attractionName: "AquaRio — Aquário Marinho",
      partnerName: "AquaRio",
      ticketTypeName: "Inteira",
      quantity: 2,
      visitDate: "2026-02-14",
      visitSlot: null,
      customerName: "Marina Souza",
      customerEmail: "marina.souza@email.com",
      customerDocument: "123.456.789-00",
    },
    ticketAssets: [],
    ...ts,
  },
  {
    id: "ful-002",
    orderId: "ord-1043",
    orderItemId: "oi-2",
    siteId: "onerio",
    partnerId: "partner-amanha",
    attractionId: "attr-amanha",
    ticketTypeId: "tt-amanha-inteira",
    strategy: "MANUAL",
    status: "PROCESSING",
    snapshot: {
      attractionName: "Museu do Amanhã",
      partnerName: "Museu do Amanhã",
      ticketTypeName: "Inteira",
      quantity: 4,
      visitDate: "2026-02-10",
      visitSlot: "14:00",
      customerName: "João Pereira",
      customerEmail: "joao.pereira@email.com",
    },
    ticketAssets: [],
    handledByUid: "operador-1",
    ...ts,
  },
  {
    id: "ful-003",
    orderId: "ord-1044",
    orderItemId: "oi-3",
    siteId: "onerio",
    partnerId: "partner-aquario",
    attractionId: "attr-aquario",
    ticketTypeId: "tt-aquario-meia",
    strategy: "MANUAL",
    status: "ISSUED",
    snapshot: {
      attractionName: "AquaRio — Aquário Marinho",
      partnerName: "AquaRio",
      ticketTypeName: "Meia-entrada",
      quantity: 1,
      visitDate: "2026-02-08",
      visitSlot: null,
      customerName: "Ana Lima",
      customerEmail: "ana.lima@email.com",
    },
    ticketAssets: [{ id: "asset-1", url: "#", fileName: "aquario-ana.pdf", code: "AQ-88213" }],
    ...ts,
  },
];

/** Pedidos de demo — vincule criando conta com o mesmo e-mail do customer. */
export const seedOrders: Order[] = [
  {
    id: "ord-1042",
    siteId: "onerio",
    status: "PROCESSING",
    customer: {
      name: "Marina Souza",
      email: "marina.souza@email.com",
      phone: "+55 21 98888-0001",
      document: "123.456.789-00",
    },
    items: [
      {
        id: "oi-1",
        productId: "prod-aquario",
        productType: "SIMPLE",
        productName: "AquaRio — Aquário Marinho",
        quantity: 2,
        unitPrice: money(12300),
        visitDate: "2026-02-14",
        visitSlot: null,
        fulfillmentIds: ["ful-001"],
      },
    ],
    subtotal: money(24600),
    discount: money(0),
    total: money(24600),
    payment: { provider: "mock", status: "PAID", method: "PIX" },
    hasManualFulfillment: true,
    ...ts,
  },
  {
    id: "ord-1043",
    siteId: "onerio",
    status: "PROCESSING",
    customer: {
      name: "João Pereira",
      email: "joao.pereira@email.com",
      phone: "+55 21 98888-0002",
    },
    items: [
      {
        id: "oi-2",
        productId: "prod-amanha",
        productType: "SIMPLE",
        productName: "Museu do Amanhã",
        quantity: 4,
        unitPrice: money(4000),
        visitDate: "2026-02-10",
        visitSlot: "14:00",
        fulfillmentIds: ["ful-002"],
      },
    ],
    subtotal: money(16000),
    discount: money(0),
    total: money(16000),
    payment: { provider: "mock", status: "PAID", method: "CREDIT_CARD" },
    hasManualFulfillment: true,
    ...ts,
  },
  {
    id: "ord-1044",
    siteId: "onerio",
    status: "COMPLETED",
    customer: {
      name: "Ana Lima",
      email: "ana.lima@email.com",
      phone: "+55 21 98888-0003",
    },
    items: [
      {
        id: "oi-3",
        productId: "prod-aquario",
        productType: "SIMPLE",
        productName: "AquaRio — Aquário Marinho",
        quantity: 1,
        unitPrice: money(8100),
        visitDate: "2026-02-08",
        visitSlot: null,
        fulfillmentIds: ["ful-003"],
      },
    ],
    subtotal: money(8100),
    discount: money(0),
    total: money(8100),
    payment: { provider: "mock", status: "PAID", method: "PIX" },
    hasManualFulfillment: true,
    ...ts,
  },
];

export const seedSites: Site[] = [
  {
    id: "onerio",
    slug: "onerio",
    name: "OneRio",
    domains: ["onerio.com", "www.onerio.com", "localhost"],
    theme: {
      brand: "0 8 95",
      brandFg: "251 255 225",
      brandMuted: "255 93 6",
      logoUrl: "/brand/onerio-logo.png",
    },
    attractionIds: null,
    partnerId: null,
    status: "PUBLISHED",
    contactEmail: "contato@onerio.com",
    supportPhone: "+55 21 90000-0000",
    ...ts,
  },
  {
    id: "site-aquario",
    slug: "aquario",
    name: "AquaRio Ingressos",
    domains: ["ingressos.aquario.example", "aquario.localhost"],
    theme: {
      brand: "12 74 110",
      brandFg: "251 255 225",
      brandMuted: "56 189 248",
      logoUrl: "",
    },
    attractionIds: ["attr-aquario"],
    partnerId: "partner-aquario",
    status: "PUBLISHED",
    contactEmail: "ingressos@aquario.example",
    ...ts,
  },
];
