"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type {
  AvailabilityMode,
  AvailabilityPolicy,
  SeasonRule,
  TimeSlot,
} from "@/features/attractions/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const WEEKDAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

interface AvailabilityEditorProps {
  value: AvailabilityPolicy;
  onChange: (next: AvailabilityPolicy) => void;
}

export function AvailabilityEditor({ value, onChange }: AvailabilityEditorProps) {
  const [blackoutInput, setBlackoutInput] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotCapacity, setSlotCapacity] = useState("50");

  function toggleWeekday(day: number) {
    const set = new Set(value.weekdays);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    onChange({ ...value, weekdays: [...set].sort() });
  }

  function addBlackout() {
    if (!blackoutInput || value.blackoutDates.includes(blackoutInput)) return;
    onChange({
      ...value,
      blackoutDates: [...value.blackoutDates, blackoutInput].sort(),
    });
    setBlackoutInput("");
  }

  function addSlot() {
    if (!/^\d{2}:\d{2}$/.test(slotStart)) return;
    const slot: TimeSlot = {
      start: slotStart,
      capacity: Number(slotCapacity) || 0,
    };
    onChange({
      ...value,
      defaultSlots: [...value.defaultSlots.filter((s) => s.start !== slot.start), slot].sort(
        (a, b) => a.start.localeCompare(b.start),
      ),
    });
    setSlotStart("");
  }

  function addSeason() {
    const season: SeasonRule = {
      id: `season-${Date.now()}`,
      label: "Nova temporada",
      from: new Date().toISOString().slice(0, 10),
      to: new Date().toISOString().slice(0, 10),
    };
    onChange({ ...value, seasons: [...value.seasons, season] });
  }

  function updateSeason(id: string, patch: Partial<SeasonRule>) {
    onChange({
      ...value,
      seasons: value.seasons.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Calendário e disponibilidade</h2>
      <p className="text-sm text-ink-muted">Slots, dias da semana, blackouts, temporadas e lead time.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Modo</span>
          <select
            value={value.mode}
            onChange={(e) => onChange({ ...value, mode: e.target.value as AvailabilityMode })}
            className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
          >
            <option value="SCHEDULED">Data e horário marcados</option>
            <option value="DATED">Data livre</option>
            <option value="OPEN">Sem data (voucher)</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Antecedência mínima (horas)</span>
          <input
            type="number"
            min={0}
            value={value.leadTimeHours}
            onChange={(e) =>
              onChange({ ...value, leadTimeHours: Number(e.target.value) || 0 })
            }
            className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
          />
        </label>
        {value.mode === "OPEN" ? (
          <label className="block">
            <span className="text-sm font-medium text-ink">Validade do voucher (dias)</span>
            <input
              type="number"
              min={0}
              value={value.validityDays ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  validityDays: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm"
            />
          </label>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-ink">Dias da semana</p>
        <p className="text-xs text-ink-subtle">Vazio = todos os dias.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => {
            const active = value.weekdays.includes(d.value);
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleWeekday(d.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  active
                    ? "border-brand bg-brand text-brand-fg"
                    : "border-surface-border text-ink-muted"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {value.mode === "SCHEDULED" ? (
        <div className="mt-6">
          <p className="text-sm font-medium text-ink">Slots padrão</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {value.defaultSlots.map((s) => (
              <span
                key={s.start}
                className="inline-flex items-center gap-2 rounded-lg bg-surface-subtle px-3 py-1.5 text-sm"
              >
                {s.start} · cap. {s.capacity}
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...value,
                      defaultSlots: value.defaultSlots.filter((x) => x.start !== s.start),
                    })
                  }
                  aria-label={`Remover slot ${s.start}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-ink-subtle" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="time"
              value={slotStart}
              onChange={(e) => setSlotStart(e.target.value)}
              className="h-10 rounded-xl border border-surface-border px-3 text-sm"
            />
            <input
              type="number"
              placeholder="Capacidade"
              value={slotCapacity}
              onChange={(e) => setSlotCapacity(e.target.value)}
              className="h-10 w-28 rounded-xl border border-surface-border px-3 text-sm"
            />
            <Button type="button" size="sm" variant="outline" onClick={addSlot}>
              <Plus className="h-4 w-4" /> Slot
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <p className="text-sm font-medium text-ink">Blackouts</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {value.blackoutDates.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-800"
            >
              {d}
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    blackoutDates: value.blackoutDates.filter((x) => x !== d),
                  })
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="date"
            value={blackoutInput}
            onChange={(e) => setBlackoutInput(e.target.value)}
            className="h-10 rounded-xl border border-surface-border px-3 text-sm"
          />
          <Button type="button" size="sm" variant="outline" onClick={addBlackout}>
            Adicionar
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">Temporadas</p>
          <Button type="button" size="sm" variant="outline" onClick={addSeason}>
            <Plus className="h-4 w-4" /> Temporada
          </Button>
        </div>
        <div className="mt-3 space-y-3">
          {value.seasons.map((s) => (
            <div
              key={s.id}
              className="grid gap-2 rounded-xl border border-surface-border p-3 sm:grid-cols-3"
            >
              <input
                value={s.label}
                onChange={(e) => updateSeason(s.id, { label: e.target.value })}
                className="h-10 rounded-lg border border-surface-border px-3 text-sm sm:col-span-3"
                placeholder="Label"
              />
              <input
                type="date"
                value={s.from}
                onChange={(e) => updateSeason(s.id, { from: e.target.value })}
                className="h-10 rounded-lg border border-surface-border px-3 text-sm"
              />
              <input
                type="date"
                value={s.to}
                onChange={(e) => updateSeason(s.id, { to: e.target.value })}
                className="h-10 rounded-lg border border-surface-border px-3 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  onChange({
                    ...value,
                    seasons: value.seasons.filter((x) => x.id !== s.id),
                  })
                }
              >
                Remover
              </Button>
            </div>
          ))}
          {value.seasons.length === 0 ? (
            <p className="text-sm text-ink-subtle">Nenhuma temporada cadastrada.</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function defaultAvailability(): AvailabilityPolicy {
  return {
    mode: "DATED",
    weekdays: [],
    defaultSlots: [],
    blackoutDates: [],
    seasons: [],
    leadTimeHours: 2,
  };
}
