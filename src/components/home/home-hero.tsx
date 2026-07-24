"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SLIDE_INTERVAL_MS = 3000;

const HERO_SLIDES = [
  "/images/hero-beta/slide-1.png",
  "/images/hero-beta/slide-2.webp",
  "/images/hero-beta/slide-3.webp",
  "/images/hero-beta/slide-4.webp",
] as const;

/**
 * Hero da home no layout OneRio beta: card marinho arredondado com o texto à
 * esquerda e slideshow com efeito Ken Burns à direita.
 */
export function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="container pt-6 md:pt-10">
      <div className="flex min-h-[450px] flex-col overflow-hidden rounded-[40px] bg-brand md:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-6 px-8 py-12 md:px-12 md:py-16">
          <h1 className="font-display text-[28px] font-semibold leading-tight text-brand-fg md:text-[42px]">
            Ingressos oficiais para viver o melhor do Rio.
          </h1>
          <p className="max-w-md text-base text-brand-fg/90 md:text-lg">
            Descubra atrações, compare opções e receba seus ingressos direto no
            seu celular.
          </p>
          <div>
            <Link
              href="/atracoes"
              className="inline-flex items-center justify-center rounded-[15px] bg-brand-muted px-6 py-4 text-sm font-semibold text-brand-fg transition-all hover:scale-105 hover:shadow-[0_0_50px_1px_rgba(255,93,6,0.85)]"
            >
              Explorar atrações
            </Link>
          </div>
        </div>

        <div
          className="relative min-h-[260px] flex-1 overflow-hidden md:min-h-0 md:rounded-r-[40px]"
          aria-hidden
        >
          {HERO_SLIDES.map((src, index) => {
            const isActive = index === activeSlide;
            return (
              <div
                key={src}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  isActive ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={cn(
                    "object-cover object-right transition-transform duration-[6000ms] ease-out",
                    isActive ? "scale-110" : "scale-100",
                  )}
                  unoptimized
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
