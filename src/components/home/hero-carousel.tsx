"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ONERIO_HERO_SLIDES } from "@/lib/onerio-assets";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 5000;

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % ONERIO_HERO_SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isPaused]);

  return (
    <section
      className="relative h-[300px] w-full overflow-hidden md:h-[588px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Destaques OneRio"
    >
      {ONERIO_HERO_SLIDES.map((slide, index) => {
        const isActive = index === active;
        return (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              isActive ? "opacity-100" : "pointer-events-none opacity-0",
            )}
            aria-hidden={!isActive}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={cn(
                "object-cover transition-transform duration-[8000ms] ease-out",
                isActive ? "scale-105" : "scale-100",
              )}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative flex h-full items-center justify-center px-5 text-center">
              <div
                className={cn(
                  "max-w-3xl transition-all duration-700",
                  isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                <h2 className="font-display text-[23px] font-bold leading-none text-brand-fg md:text-[35px]">
                  {slide.title}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[13px] font-light leading-snug text-brand-fg md:mt-7 md:text-[17px] md:leading-relaxed">
                  {slide.description}
                </p>
                <Link
                  href={slide.href}
                  className="mt-5 inline-flex items-center justify-center rounded-full border-2 border-brand-fg px-6 py-2.5 text-sm font-semibold text-brand-fg transition-colors hover:border-brand-muted hover:bg-brand-muted md:mt-8 md:px-8 md:py-3 md:text-base"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-6">
        {ONERIO_HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Ir para slide ${index + 1}`}
            aria-current={index === active}
            onClick={() => setActive(index)}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              index === active ? "bg-brand-fg" : "bg-brand-fg/40 hover:bg-brand-fg/70",
            )}
          />
        ))}
      </div>
    </section>
  );
}
