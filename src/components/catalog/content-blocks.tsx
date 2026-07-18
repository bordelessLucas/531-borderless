import Image from "next/image";
import type { ContentBlock } from "@/features/attractions/types";

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h3 key={i} className="font-display text-xl font-semibold text-ink">
                {block.text}
              </h3>
            );
          case "paragraph":
            return (
              <p key={i} className="leading-relaxed text-ink-muted">
                {block.text}
              </p>
            );
          case "bullets":
            return (
              <ul key={i} className="space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-ink-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-muted" />
                    {item}
                  </li>
                ))}
              </ul>
            );
          case "image":
            return (
              <div key={i} className="relative aspect-video overflow-hidden rounded-2xl">
                <Image src={block.image.url} alt={block.image.alt} fill className="object-cover" />
              </div>
            );
          case "faq":
            return (
              <div key={i} className="space-y-3">
                {block.items.map((item, j) => (
                  <details key={j} className="rounded-xl border border-surface-border p-4">
                    <summary className="cursor-pointer font-medium text-ink">{item.question}</summary>
                    <p className="mt-2 text-sm text-ink-muted">{item.answer}</p>
                  </details>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
