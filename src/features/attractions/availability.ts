import type { AvailabilityPolicy, TimeSlot } from "@/features/attractions/types";

export interface AvailableDay {
  iso: string;
  label: string;
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function meetsLeadTime(iso: string, leadTimeHours: number, now = new Date()): boolean {
  const visit = parseLocalDate(iso);
  visit.setHours(23, 59, 59, 999);
  const earliest = new Date(now.getTime() + leadTimeHours * 60 * 60 * 1000);
  return visit >= earliest;
}

function weekdayAllowed(iso: string, weekdays: number[]): boolean {
  if (!weekdays.length) return true;
  return weekdays.includes(parseLocalDate(iso).getDay());
}

function seasonSlots(policy: AvailabilityPolicy, iso: string): TimeSlot[] | null {
  for (const season of policy.seasons) {
    if (iso >= season.from && iso <= season.to && season.slots?.length) {
      return season.slots;
    }
  }
  return null;
}

/** Datas vendáveis nos próximos N dias (respeita weekdays, blackouts e lead time). */
export function listAvailableDays(
  policy: AvailabilityPolicy,
  daysAhead = 14,
  now = new Date(),
): AvailableDay[] {
  if (policy.mode === "OPEN") return [];

  const blackouts = new Set(policy.blackoutDates);
  const out: AvailableDay[] = [];
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < daysAhead * 2 && out.length < daysAhead; i++) {
    cursor.setDate(cursor.getDate() + 1);
    const iso = toIso(cursor);
    if (blackouts.has(iso)) continue;
    if (!weekdayAllowed(iso, policy.weekdays)) continue;
    if (!meetsLeadTime(iso, policy.leadTimeHours, now)) continue;
    out.push({
      iso,
      label: cursor.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }),
    });
  }

  return out;
}

/** Slots do dia (temporada sobrescreve default). */
export function slotsForDate(policy: AvailabilityPolicy, iso: string): TimeSlot[] {
  if (policy.mode !== "SCHEDULED") return [];
  return seasonSlots(policy, iso) ?? policy.defaultSlots;
}

export function isDateAvailable(
  policy: AvailabilityPolicy,
  iso: string,
  now = new Date(),
): boolean {
  if (policy.mode === "OPEN") return true;
  if (policy.blackoutDates.includes(iso)) return false;
  if (!weekdayAllowed(iso, policy.weekdays)) return false;
  return meetsLeadTime(iso, policy.leadTimeHours, now);
}
