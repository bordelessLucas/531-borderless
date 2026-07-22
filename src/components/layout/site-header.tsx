"use client";

import Link from "next/link";
import { MapPin, User } from "lucide-react";
import type { Site } from "@/features/tenant/types";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { useAuth } from "@/features/auth/auth-provider";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";

export function SiteHeader({ site }: { site: Site }) {
  const { user, isStaff, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border/80 bg-surface/92 backdrop-blur-md">
      <div className="container flex h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label={site.name}>
          <BrandMark name={site.name} logoUrl={site.theme.logoUrl || undefined} />
        </Link>

        <nav className="hidden items-center gap-9 text-[15px] font-medium text-ink-muted md:flex">
          <Link href="/atracoes" className="transition-colors hover:text-ink">
            Atrações
          </Link>
          <Link href="/passaportes" className="transition-colors hover:text-ink">
            Passaportes
          </Link>
          <span className="flex items-center gap-1.5 text-sm text-ink-subtle">
            <MapPin className="h-4 w-4" /> Rio de Janeiro
          </span>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoading && user ? (
            <>
              <Link href="/conta">
                <Button size="md" variant="ghost">
                  <User className="h-4 w-4" />
                  Conta
                </Button>
              </Link>
              {isStaff ? (
                <Link href="/admin" className="hidden sm:block">
                  <Button size="md" variant="outline">
                    Admin
                  </Button>
                </Link>
              ) : null}
              <Button size="md" variant="outline" onClick={() => void logout()}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="md" variant="ghost">
                  Entrar
                </Button>
              </Link>
              <Link href="/passaportes">
                <Button size="md">{ONERIO_VOICE.header.ctaGuest}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
