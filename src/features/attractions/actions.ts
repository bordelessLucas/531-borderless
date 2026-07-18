"use server";

import { z } from "zod";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

const availabilityModeSchema = z.enum(["SCHEDULED", "DATED", "OPEN"]);

const attractionFormSchema = z.object({
  id: z.string().optional(),
  partnerId: z.string().min(1, "Selecione o parceiro"),
  name: z.string().min(3, "Nome muito curto"),
  slug: z.string().min(3, "Slug inválido"),
  shortDescription: z.string().min(10, "Descrição muito curta"),
  city: z.string().min(2),
  heroImageUrl: z.string().url("URL de imagem inválida"),
  availabilityMode: availabilityModeSchema,
  leadTimeHours: z.coerce.number().min(0),
  validityDays: z.coerce.number().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type AttractionActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function saveAttraction(
  _prev: AttractionActionState,
  formData: FormData,
): Promise<AttractionActionState> {
  const parsed = attractionFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Corrija os campos destacados.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const now = new Date().toISOString();

  try {
    const db = getAdminDb();
    const col = db.collection(COLLECTIONS.attractions);
    const ref = data.id ? col.doc(data.id) : col.doc();
    await ref.set(
      {
        partnerId: data.partnerId,
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        city: data.city,
        heroImage: { url: data.heroImageUrl, alt: data.name },
        availability: {
          mode: data.availabilityMode,
          leadTimeHours: data.leadTimeHours,
          validityDays: data.validityDays ?? null,
        },
        status: data.status,
        updatedAt: now,
        ...(data.id ? {} : { createdAt: now }),
      },
      { merge: true },
    );
    return { ok: true, message: "Atração salva com sucesso." };
  } catch {
    // Sem credenciais/emulador ainda: não quebra o protótipo.
    return {
      ok: false,
      message:
        "Validação ok. Persistência pendente: conecte o Firebase (emulador ou projeto) para salvar de fato.",
    };
  }
}
