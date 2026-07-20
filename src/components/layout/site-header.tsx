"use client";

import Link from "next/link";
import { MapPin, Ticket, User } from "lucide-react";
import type { Site } from "@/features/tenant/types";
import { useAuth } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function SiteHeader({ site }: { site: Site }) {
  const { user, isStaff, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-fg">
            <Ticket className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
          <Link href="/atracoes" className="transition-colors hover:text-ink">Atrações</Link>
          <Link href="/passaportes" className="transition-colors hover:text-ink">Passaportes</Link>
          <span className="flex items-center gap-1 text-ink-subtle">
            <MapPin className="h-4 w-4" /> Rio de Janeiro
          </span>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoading && user ? (
            <>
              <Link href="/conta">
                <Button size="sm" variant="ghost">
                  <User className="h-4 w-4" />
                  Conta
                </Button>
              </Link>
              {isStaff ? (
                <Link href="/admin" className="hidden sm:block">
                  <Button size="sm" variant="outline">Admin</Button>
                </Link>
              ) : null}
              <Button size="sm" variant="outline" onClick={() => void logout()}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">Entrar</Button>
              </Link>
              <Link href="/passaportes">
                <Button size="sm">Explorar passaportes</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
