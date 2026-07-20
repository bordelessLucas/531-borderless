"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  MapPinned,
  Ticket,
  Inbox,
  Globe,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-provider";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/fila", label: "Fila de emissão", icon: Inbox },
  { href: "/admin/atracoes", label: "Atrações", icon: MapPinned },
  { href: "/admin/passaportes", label: "Passaportes", icon: Ticket },
  { href: "/admin/parceiros", label: "Parceiros", icon: Building2 },
  { href: "/admin/sites", label: "Sites", icon: Globe },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function onLogout() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-surface-border bg-surface px-4 py-6 lg:block">
      <Link href="/admin" className="flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-fg">
          <Ticket className="h-4 w-4" />
        </span>
        <span className="font-display text-lg font-semibold text-ink">OneRio</span>
        <span className="rounded bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium text-ink-subtle">admin</span>
      </Link>

      <nav className="mt-8 space-y-1">
        {nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-brand text-brand-fg" : "text-ink-muted hover:bg-surface-subtle hover:text-ink",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 space-y-2 px-3">
        {user?.email ? (
          <p className="truncate text-xs text-ink-subtle">{user.email}</p>
        ) : null}
        <button
          type="button"
          onClick={() => void onLogout()}
          className="flex items-center gap-2 text-xs text-ink-muted hover:text-ink"
        >
          <LogOut className="h-3.5 w-3.5" /> Sair
        </button>
        <Link href="/" className="block text-xs text-ink-subtle hover:text-ink">
          ← Ver site
        </Link>
      </div>
    </aside>
  );
}
