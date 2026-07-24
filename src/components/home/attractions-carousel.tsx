"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/features/catalog/types";
import { ProductCard } from "@/components/catalog/product-card";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 5000;

/**
 * Carrossel "NO RIO AGORA" do layout beta: 3 cards por tela no desktop,
 * setas laterais, bullets e autoplay com pausa no hover.
 */
export function AttractionsCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollToIndex = useCallback((index: number, total: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = ((index % total) + total) % total;
    const slide = track.children.item(clamped) as HTMLElement | null;
    if (!slide) return;
    track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    setActiveIndex(clamped);
  }, []);

  useEffect(() => {
    if (isPaused || products.length <= 1) return;
    const id = window.setInterval(() => {
      scrollToIndex(activeIndex + 1, products.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [activeIndex, isPaused, products.length, scrollToIndex]);

  if (products.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={trackRef}
        className="scrollbar-none -mx-1 flex snap-x snap-mandatory gap-[30px] overflow-x-auto scroll-smooth px-1 pb-2 pt-1"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-15px)] lg:w-[calc(33.333%-20px)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {products.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={() => scrollToIndex(activeIndex - 1, products.length)}
            className="absolute -left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-brand-fg shadow-float transition-colors hover:bg-brand-muted md:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Próximo slide"
            onClick={() => scrollToIndex(activeIndex + 1, products.length)}
            className="absolute -right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-brand-fg shadow-float transition-colors hover:bg-brand-muted md:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-6 flex justify-center gap-2">
            {products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                aria-label={`Ir para o slide ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => scrollToIndex(index, products.length)}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  index === activeIndex
                    ? "bg-brand"
                    : "bg-brand/25 hover:bg-brand/50",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
