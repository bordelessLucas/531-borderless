"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { Attraction } from "@/features/attractions/types";
import type { Partner } from "@/features/partners/types";
import {
  saveAttraction,
  type AttractionActionState,
} from "@/features/attractions/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AttractionEditorProps {
  attraction: Attraction | null;
  partners: Partner[];
}

const initialState: AttractionActionState = { ok: false, message: "" };

export function AttractionEditor({ attraction, partners }: AttractionEditorProps) {
  const [state, formAction] = useActionState(saveAttraction, initialState);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {attraction ? <input type="hidden" name="id" value={attraction.id} /> : null}

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Informações gerais</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField name="name" label="Nome" defaultValue={attraction?.name} error={state.errors?.name} />
            <TextField name="slug" label="Slug" defaultValue={attraction?.slug} error={state.errors?.slug} />
            <div className="sm:col-span-2">
              <TextField
                name="shortDescription"
                label="Descrição curta"
                defaultValue={attraction?.shortDescription}
                error={state.errors?.shortDescription}
              />
            </div>
            <TextField name="city" label="Cidade" defaultValue={attraction?.city} error={state.errors?.city} />
            <SelectField
              name="partnerId"
              label="Parceiro"
              defaultValue={attraction?.partnerId}
              error={state.errors?.partnerId}
              options={partners.map((p) => ({ value: p.id, label: p.name }))}
            />
            <div className="sm:col-span-2">
              <TextField
                name="heroImageUrl"
                label="Imagem principal (URL)"
                defaultValue={attraction?.heroImage.url}
                error={state.errors?.heroImageUrl}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Disponibilidade</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SelectField
              name="availabilityMode"
              label="Modo"
              defaultValue={attraction?.availability.mode ?? "DATED"}
              options={[
                { value: "SCHEDULED", label: "Data e horário marcados" },
                { value: "DATED", label: "Data livre" },
                { value: "OPEN", label: "Sem data (voucher)" },
              ]}
            />
            <TextField
              name="leadTimeHours"
              label="Antecedência mínima (horas)"
              type="number"
              defaultValue={String(attraction?.availability.leadTimeHours ?? 2)}
            />
            <TextField
              name="validityDays"
              label="Validade do voucher (dias)"
              type="number"
              defaultValue={attraction?.availability.validityDays ? String(attraction.availability.validityDays) : ""}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Publicação</h2>
          <div className="mt-4">
            <SelectField
              name="status"
              label="Status"
              defaultValue={attraction?.status ?? "DRAFT"}
              options={[
                { value: "DRAFT", label: "Rascunho" },
                { value: "PUBLISHED", label: "Publicada" },
                { value: "ARCHIVED", label: "Arquivada" },
              ]}
            />
          </div>
          <SubmitButton />
          {state.message ? (
            <p
              className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                state.ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {state.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
              {state.message}
            </p>
          ) : null}
        </Card>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="mt-5 w-full" disabled={pending}>
      {pending ? "Salvando..." : "Salvar atração"}
    </Button>
  );
}

function TextField({
  name,
  label,
  defaultValue,
  type = "text",
  error,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  error?: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
      {error?.[0] ? <span className="mt-1 block text-xs text-red-600">{error[0]}</span> : null}
    </label>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options,
  error,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  error?: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1.5 h-11 w-full rounded-xl border border-surface-border bg-surface px-3.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error?.[0] ? <span className="mt-1 block text-xs text-red-600">{error[0]}</span> : null}
    </label>
  );
}
