import type { PartnerAdapter } from "@/features/fulfillment/adapters/types";
import { ManualAdapter } from "@/features/fulfillment/adapters/manual.adapter";

/**
 * Registro central de adapters. Novos parceiros de API se registram aqui.
 * Resolução por `adapterKey` do Partner; fallback sempre para manual.
 */
const adapters = new Map<string, PartnerAdapter>();

function register(adapter: PartnerAdapter): void {
  adapters.set(adapter.key, adapter);
}

register(new ManualAdapter());
// register(new SymplaAdapter());  <- exemplo de integração futura

export function resolveAdapter(adapterKey: string | undefined): PartnerAdapter {
  if (!adapterKey) return adapters.get("manual")!;
  return adapters.get(adapterKey) ?? adapters.get("manual")!;
}
