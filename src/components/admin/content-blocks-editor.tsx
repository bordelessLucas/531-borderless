"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ContentBlock } from "@/features/attractions/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ContentBlocksEditorProps {
  value: ContentBlock[];
  onChange: (next: ContentBlock[]) => void;
}

export function ContentBlocksEditor({ value, onChange }: ContentBlocksEditorProps) {
  function updateAt(index: number, block: ContentBlock) {
    onChange(value.map((b, i) => (i === index ? block : b)));
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add(type: ContentBlock["type"]) {
    const block: ContentBlock =
      type === "paragraph"
        ? { type: "paragraph", text: "" }
        : type === "heading"
          ? { type: "heading", text: "" }
          : type === "bullets"
            ? { type: "bullets", items: [""] }
            : type === "image"
              ? { type: "image", image: { url: "", alt: "" } }
              : { type: "faq", items: [{ question: "", answer: "" }] };
    onChange([...value, block]);
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Conteúdo rico</h2>
          <p className="text-sm text-ink-muted">Parágrafos, títulos, bullets, imagem e FAQ.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["paragraph", "Parágrafo"],
              ["heading", "Título"],
              ["bullets", "Bullets"],
              ["image", "Imagem"],
              ["faq", "FAQ"],
            ] as const
          ).map(([type, label]) => (
            <Button key={type} type="button" size="sm" variant="outline" onClick={() => add(type)}>
              <Plus className="h-3.5 w-3.5" /> {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {value.map((block, index) => (
          <div key={index} className="rounded-xl border border-surface-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-ink-subtle">{block.type}</span>
              <button type="button" onClick={() => removeAt(index)} aria-label="Remover bloco">
                <Trash2 className="h-4 w-4 text-ink-subtle hover:text-red-600" />
              </button>
            </div>

            {block.type === "paragraph" || block.type === "heading" ? (
              <textarea
                value={block.text}
                rows={block.type === "heading" ? 2 : 4}
                onChange={(e) => updateAt(index, { ...block, text: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-brand"
              />
            ) : null}

            {block.type === "bullets" ? (
              <div className="space-y-2">
                {block.items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={item}
                      onChange={(e) => {
                        const items = block.items.map((x, j) =>
                          j === i ? e.target.value : x,
                        );
                        updateAt(index, { type: "bullets", items });
                      }}
                      className="h-10 flex-1 rounded-xl border border-surface-border px-3 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateAt(index, {
                          type: "bullets",
                          items: block.items.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-ink-subtle" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updateAt(index, { type: "bullets", items: [...block.items, ""] })
                  }
                >
                  + Item
                </Button>
              </div>
            ) : null}

            {block.type === "image" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  placeholder="URL da imagem"
                  value={block.image.url}
                  onChange={(e) =>
                    updateAt(index, {
                      type: "image",
                      image: { ...block.image, url: e.target.value },
                    })
                  }
                  className="h-10 rounded-xl border border-surface-border px-3 text-sm"
                />
                <input
                  placeholder="Alt text"
                  value={block.image.alt}
                  onChange={(e) =>
                    updateAt(index, {
                      type: "image",
                      image: { ...block.image, alt: e.target.value },
                    })
                  }
                  className="h-10 rounded-xl border border-surface-border px-3 text-sm"
                />
              </div>
            ) : null}

            {block.type === "faq" ? (
              <div className="space-y-3">
                {block.items.map((item, i) => (
                  <div key={i} className="space-y-2 rounded-lg bg-surface-subtle p-3">
                    <input
                      placeholder="Pergunta"
                      value={item.question}
                      onChange={(e) => {
                        const items = block.items.map((x, j) =>
                          j === i ? { ...x, question: e.target.value } : x,
                        );
                        updateAt(index, { type: "faq", items });
                      }}
                      className="h-10 w-full rounded-lg border border-surface-border px-3 text-sm"
                    />
                    <textarea
                      placeholder="Resposta"
                      value={item.answer}
                      rows={2}
                      onChange={(e) => {
                        const items = block.items.map((x, j) =>
                          j === i ? { ...x, answer: e.target.value } : x,
                        );
                        updateAt(index, { type: "faq", items });
                      }}
                      className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updateAt(index, {
                      type: "faq",
                      items: [...block.items, { question: "", answer: "" }],
                    })
                  }
                >
                  + Pergunta
                </Button>
              </div>
            ) : null}
          </div>
        ))}
        {value.length === 0 ? (
          <p className="text-sm text-ink-subtle">Nenhum bloco ainda. Adicione conteúdo acima.</p>
        ) : null}
      </div>
    </Card>
  );
}
