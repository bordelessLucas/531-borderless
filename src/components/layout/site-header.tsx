"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, User, X } from "lucide-react";
import type { Site } from "@/features/tenant/types";
import { useAuth } from "@/features/auth/auth-provider";
import { BrandMark } from "@/components/layout/brand-mark";
import { resolveSiteLogoUrl } from "@/features/tenant/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Início" },
  {
    href: "/atracoes",
    label: "Ingressos",
    children: [
      { href: "/atracoes/aquario-rio", label: "AquaRio" },
      { href: "/atracoes/yup-star-roda-gigante", label: "Roda Gigante" },
      { href: "/atracoes/bioparque-do-rio", label: "BioParque do Rio" },
      { href: "/atracoes", label: "Todas as atrações" },
    ],
  },
  { href: "/passaportes", label: "Passaportes" },
  { href: "/conta", label: "Área do Cliente" },
] as const;

export function SiteHeader({ site }: { site: Site }) {
  const { user, isStaff, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [ingressosOpen, setIngressosOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-brand text-brand-fg shadow-sm">
      <div className="container flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label={site.name}>
          <BrandMark name={site.name} logoUrl={resolveSiteLogoUrl(site)} inverted />
        </Link>

        <nav className="hidden items-center gap-1 text-[15px] font-medium md:flex">
          {NAV.map((item) =>
            "children" in item && item.children ? (
              <div key={item.label} className="relative group">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-brand-fg/90 transition-colors hover:bg-brand-fg/10 hover:text-brand-fg"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>
                <div className="invisible absolute left-0 top-full z-50 min-w-[220px] pt-1 opacity-0 transition group-hover:visible group-hover:opacity-100">
                  <ul className="rounded-xl border border-brand-fg/15 bg-brand py-2 shadow-float">
                    {item.children.map((child) => (
                      <li key={child.href + child.label}>
                        <Link
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-brand-fg/85 hover:bg-brand-fg/10 hover:text-brand-fg"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-brand-fg/90 transition-colors hover:bg-brand-fg/10 hover:text-brand-fg"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!isLoading && user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/conta">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-brand-fg hover:bg-brand-fg/10 hover:text-brand-fg"
                >
                  <User className="h-4 w-4" />
                  Conta
                </Button>
              </Link>
              {isStaff ? (
                <Link href="/admin">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-brand-fg/30 bg-transparent text-brand-fg hover:bg-brand-fg/10"
                  >
                    Admin
                  </Button>
                </Link>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                className="border-brand-fg/30 bg-transparent text-brand-fg hover:bg-brand-fg/10"
                onClick={() => void logout()}
              >
                Sair
              </Button>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button
                size="sm"
                variant="outline"
                className="border-brand-fg/35 bg-transparent text-brand-fg hover:border-brand-muted hover:bg-brand-muted"
              >
                Entrar
              </Button>
            </Link>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-fg hover:bg-brand-fg/10 md:hidden"
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-brand-fg/10 bg-brand md:hidden",
          isOpen ? "block" : "hidden",
        )}
      >
        <nav className="container flex flex-col gap-1 py-3">
          {NAV.map((item) =>
            "children" in item && item.children ? (
              <div key={item.label}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-brand-fg/90"
                  onClick={() => setIngressosOpen((v) => !v)}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      ingressosOpen && "rotate-180",
                    )}
                  />
                </button>
                {ingressosOpen ? (
                  <ul className="mb-1 ml-3 border-l border-brand-fg/15 pl-3">
                    {item.children.map((child) => (
                      <li key={child.href + child.label}>
                        <Link
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-sm text-brand-fg/80"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-brand-fg/90"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ),
          )}
          <div className="mt-2 border-t border-brand-fg/10 pt-3">
            {!isLoading && user ? (
              <div className="flex flex-col gap-2">
                <Link href="/conta" onClick={() => setIsOpen(false)}>
                  <Button
                    size="md"
                    variant="outline"
                    className="w-full border-brand-fg/30 bg-transparent text-brand-fg"
                  >
                    Conta
                  </Button>
                </Link>
                <Button
                  size="md"
                  variant="ghost"
                  className="w-full text-brand-fg"
                  onClick={() => {
                    setIsOpen(false);
                    void logout();
                  }}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button size="md" variant="secondary" className="w-full">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
