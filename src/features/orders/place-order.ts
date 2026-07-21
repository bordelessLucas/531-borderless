"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { Attraction, TicketType } from "@/features/attractions/types";
import type { Product } from "@/features/catalog/types";
import type { Partner } from "@/features/partners/types";
import type {
  Customer,
  Order,
  OrderItem,
  PaymentRef,
} from "@/features/orders/types";
import {
  buildFulfillmentsFromLines,
  type FulfillmentLineInput,
} from "@/features/fulfillment/orchestrate";
import { money, type Money } from "@/features/shared/types";

export interface CheckoutTicketLine {
  ticketTypeId: string;
  quantity: number;
  unitPrice: Money;
  label: string;
}

export interface PlaceOrderInput {
  customerUid: string;
  siteId: string;
  product: Product;
  customer: Customer;
  paymentMethod: "PIX" | "CREDIT_CARD";
  ticketLines: CheckoutTicketLine[];
  visitDate: string | null;
  visitSlot: string | null;
  passportQuantity?: number;
}

export interface PlaceOrderResult {
  orderId: string;
  fulfillmentCount: number;
  hasManualFulfillment: boolean;
}

function asEntity<T extends { id: string }>(
  id: string,
  data: Record<string, unknown>,
): T {
  return { id, ...data } as T;
}

function newDocId(): string {
  return doc(collection(getDb(), "_")).id;
}

async function loadMaps(product: Product): Promise<{
  attractionsById: Map<string, Attraction>;
  ticketTypesById: Map<string, TicketType>;
  partnersById: Map<string, Partner>;
}> {
  const db = getDb();
  const attractionsById = new Map<string, Attraction>();
  const ticketTypesById = new Map<string, TicketType>();
  const partnersById = new Map<string, Partner>();

  const attractionIds = new Set<string>();
  const ticketTypeIds = new Set<string>();

  if (product.type === "SIMPLE" && product.attractionId) {
    attractionIds.add(product.attractionId);
  }
  if (product.type === "PASSPORT" && product.composition) {
    for (const item of product.composition.items) {
      attractionIds.add(item.attractionId);
      ticketTypeIds.add(item.ticketTypeId);
    }
  }

  for (const id of attractionIds) {
    const snap = await getDoc(doc(db, COLLECTIONS.attractions, id));
    if (snap.exists()) {
      attractionsById.set(
        id,
        asEntity<Attraction>(id, snap.data() as Record<string, unknown>),
      );
    }
  }

  if (product.type === "SIMPLE" && product.attractionId) {
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.ticketTypes),
        where("attractionId", "==", product.attractionId),
      ),
    );
    for (const d of snap.docs) {
      ticketTypesById.set(
        d.id,
        asEntity<TicketType>(d.id, d.data() as Record<string, unknown>),
      );
    }
  } else {
    for (const id of ticketTypeIds) {
      const snap = await getDoc(doc(db, COLLECTIONS.ticketTypes, id));
      if (snap.exists()) {
        ticketTypesById.set(
          id,
          asEntity<TicketType>(id, snap.data() as Record<string, unknown>),
        );
      }
    }
  }

  for (const id of new Set([...attractionsById.values()].map((a) => a.partnerId))) {
    const snap = await getDoc(doc(db, COLLECTIONS.partners, id));
    if (snap.exists()) {
      partnersById.set(
        id,
        asEntity<Partner>(id, snap.data() as Record<string, unknown>),
      );
    }
  }

  return { attractionsById, ticketTypesById, partnersById };
}

function buildEmissionLines(
  product: Product,
  ticketLines: CheckoutTicketLine[],
  visitDate: string | null,
  visitSlot: string | null,
  passportQuantity: number,
): FulfillmentLineInput[] {
  if (product.type === "PASSPORT" && product.composition) {
    return product.composition.items.map((item) => ({
      attractionId: item.attractionId,
      ticketTypeId: item.ticketTypeId,
      quantity: item.quantity * passportQuantity,
      visitDate: null,
      visitSlot: null,
    }));
  }

  if (!product.attractionId) return [];

  return ticketLines.map((line) => ({
    attractionId: product.attractionId!,
    ticketTypeId: line.ticketTypeId,
    quantity: line.quantity,
    visitDate,
    visitSlot,
  }));
}

/**
 * Persiste Order + Fulfillments (pagamento mock = PAID).
 * Exige usuário autenticado (rules: customerUid == auth.uid).
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const db = getDb();
  const now = new Date().toISOString();
  const { attractionsById, ticketTypesById, partnersById } = await loadMaps(
    input.product,
  );

  const passportQty =
    input.passportQuantity ??
    (input.product.type === "PASSPORT"
      ? input.ticketLines[0]?.quantity ?? 1
      : 1);

  const emissionLines = buildEmissionLines(
    input.product,
    input.ticketLines,
    input.visitDate,
    input.visitSlot,
    passportQty,
  );

  if (emissionLines.length === 0) {
    throw new Error("Não há itens para emitir neste pedido.");
  }

  const orderRef = doc(collection(db, COLLECTIONS.orders));
  const orderItemId = newDocId();

  const fulfillments = buildFulfillmentsFromLines({
    orderId: orderRef.id,
    orderItemId,
    siteId: input.siteId,
    customerUid: input.customerUid,
    customer: input.customer,
    lines: emissionLines,
    attractionsById,
    ticketTypesById,
    partnersById,
    now,
    newId: newDocId,
  });

  if (fulfillments.length === 0) {
    throw new Error("Falha ao montar emissões — verifique atrações e categorias.");
  }

  const hasManualFulfillment = fulfillments.some((f) => f.strategy === "MANUAL");

  let subtotalAmount = 0;
  const orderItems: OrderItem[] = [];

  if (input.product.type === "PASSPORT") {
    const unit = input.product.passportPrice ?? input.product.fromPrice;
    subtotalAmount = unit.amount * passportQty;
    orderItems.push({
      id: orderItemId,
      productId: input.product.id,
      productType: "PASSPORT",
      productName: input.product.name,
      quantity: passportQty,
      unitPrice: unit,
      visitDate: null,
      visitSlot: null,
      fulfillmentIds: fulfillments.map((f) => f.id),
    });
  } else {
    for (const line of input.ticketLines) {
      subtotalAmount += line.unitPrice.amount * line.quantity;
    }
    const totalQty = input.ticketLines.reduce((s, l) => s + l.quantity, 0);
    orderItems.push({
      id: orderItemId,
      productId: input.product.id,
      productType: "SIMPLE",
      productName: input.product.name,
      quantity: totalQty,
      unitPrice: money(Math.round(subtotalAmount / Math.max(1, totalQty))),
      visitDate: input.visitDate,
      visitSlot: input.visitSlot,
      fulfillmentIds: fulfillments.map((f) => f.id),
    });
  }

  const payment: PaymentRef = {
    provider: "mock",
    status: "PAID",
    method: input.paymentMethod,
    externalId: `mock_${orderRef.id}`,
  };

  const document = input.customer.document?.trim();
  const customer: Customer = {
    name: input.customer.name,
    email: input.customer.email,
    phone: input.customer.phone,
    ...(document ? { document } : {}),
  };

  const orderBody: Omit<Order, "id"> = {
    siteId: input.siteId,
    customerUid: input.customerUid,
    status: "PROCESSING",
    customer,
    items: orderItems,
    subtotal: money(subtotalAmount),
    discount: money(0),
    total: money(subtotalAmount),
    payment,
    hasManualFulfillment,
    createdAt: now,
    updatedAt: now,
  };

  const batch = writeBatch(db);
  batch.set(orderRef, orderBody);

  for (const f of fulfillments) {
    const { id, ...rest } = f;
    const { customerDocument, ...snapshotRest } = rest.snapshot;
    const body = {
      ...rest,
      snapshot: {
        ...snapshotRest,
        ...(customerDocument ? { customerDocument } : {}),
      },
    };
    batch.set(doc(db, COLLECTIONS.fulfillments, id), body);
  }

  await batch.commit();

  return {
    orderId: orderRef.id,
    fulfillmentCount: fulfillments.length,
    hasManualFulfillment,
  };
}
