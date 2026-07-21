import type { Attraction, TicketType } from "@/features/attractions/types";
import type { Partner, FulfillmentStrategy } from "@/features/partners/types";
import type { Customer } from "@/features/orders/types";
import type { Fulfillment } from "@/features/fulfillment/types";
import type { ID } from "@/features/shared/types";

/** Linha de emissão com ticketTypeId explícito. */
export interface FulfillmentLineInput {
  attractionId: string;
  ticketTypeId: string;
  quantity: number;
  visitDate: string | null;
  visitSlot: string | null;
}

function resolveStrategy(
  ticketType: TicketType,
  partner: Partner | undefined,
): FulfillmentStrategy {
  return ticketType.strategy ?? partner?.defaultStrategy ?? "MANUAL";
}

/**
 * Explode linhas de pedido em N Fulfillments (1 por atração/categoria a emitir).
 * SIMPLE → 1 por categoria; PASSPORT → 1 por item da composição × quantidade.
 */
export function buildFulfillmentsFromLines(input: {
  orderId: ID;
  orderItemId: ID;
  siteId: ID;
  customerUid: ID;
  customer: Customer;
  lines: FulfillmentLineInput[];
  attractionsById: Map<string, Attraction>;
  ticketTypesById: Map<string, TicketType>;
  partnersById: Map<string, Partner>;
  now: string;
  newId: () => string;
}): Fulfillment[] {
  return input.lines.flatMap((line) => {
    const attraction = input.attractionsById.get(line.attractionId);
    const ticketType = input.ticketTypesById.get(line.ticketTypeId);
    if (!attraction || !ticketType) return [];

    const partner = input.partnersById.get(attraction.partnerId);
    const strategy = resolveStrategy(ticketType, partner);
    const id = input.newId();

    const fulfillment: Fulfillment = {
      id,
      orderId: input.orderId,
      orderItemId: input.orderItemId,
      siteId: input.siteId,
      customerUid: input.customerUid,
      partnerId: attraction.partnerId,
      attractionId: attraction.id,
      ticketTypeId: ticketType.id,
      strategy,
      status: "PENDING",
      snapshot: {
        attractionName: attraction.name,
        partnerName: partner?.name ?? attraction.partnerId,
        ticketTypeName: ticketType.name,
        quantity: line.quantity,
        visitDate: line.visitDate,
        visitSlot: line.visitSlot,
        customerName: input.customer.name,
        customerEmail: input.customer.email,
        ...(input.customer.document
          ? { customerDocument: input.customer.document }
          : {}),
      },
      ticketAssets: [],
      createdAt: input.now,
      updatedAt: input.now,
    };

    return [fulfillment];
  });
}
