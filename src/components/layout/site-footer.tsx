import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Site } from "@/features/tenant/types";
import { ONERIO_LOGO_MARK_URL } from "@/features/tenant/brand";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.5 1 .4.4.7.9 1 1.5.2.4.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-1 1.5-.4.4-.9.7-1.5 1-.4.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.5-1-.4-.4-.7-.9-1-1.5-.2-.4-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 1-1.5.4-.4.9-.7 1.5-1 .4-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2m0 1.8c-3.2 0-3.5 0-4.8.1-1 .1-1.6.2-1.9.4-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.4-.3.9-.4 1.9-.1 1.2-.1 1.6-.1 4.8s0 3.5.1 4.8c.1 1 .2 1.6.4 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.1.9.3 1.9.4 1.2.1 1.6.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.2 1.9-.4.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.4.3-.9.4-1.9.1-1.2.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1-.2-1.6-.4-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.4-.1-.9-.3-1.9-.4-1.2-.1-1.6-.1-4.8-.1m0 3.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6m0 1.8a3 3 0 1 0 0 6 3 3 0 0 0 0-6m5.9-.9a1.1 1.1 0 1 1 0 2.3 1.1 1.1 0 0 1 0-2.3" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M14 8.2V6.5c0-.6.1-1 .9-1H16V3h-2.2C11.3 3 10 4.5 10 6.8v1.4H8v2.7h2V21h3.1v-9.1h2.1l.3-2.7H13.1z" />
    </svg>
  );
}

export function SiteFooter({ site }: { site: Site }) {
  const phone = site.supportPhone ?? "(21) 97613-7463";
  const email = site.contactEmail || "contato@oneriopass.com";
  const waDigits = phone.replace(/\D/g, "");

  return (
    <footer className="bg-brand text-brand-fg">
      <div className="container grid gap-10 py-14 md:grid-cols-4 md:gap-8">
        <div className="flex flex-col items-start">
          <Link href="/" aria-label={site.name}>
            <Image
              src={ONERIO_LOGO_MARK_URL}
              alt={site.name}
              width={120}
              height={120}
              className="h-24 w-24 object-contain"
              unoptimized
            />
          </Link>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Menu
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-brand-fg/80">
            <li>
              <Link href="/" className="hover:text-brand-fg">
                Início
              </Link>
            </li>
            <li>
              <Link href="/atracoes" className="hover:text-brand-fg">
                Ingressos
              </Link>
            </li>
            <li>
              <Link href="/passaportes" className="hover:text-brand-fg">
                Passaportes
              </Link>
            </li>
            <li>
              <Link href="/conta" className="hover:text-brand-fg">
                Área do Cliente
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Contato
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-brand-fg/80">
            <li>{phone}</li>
            <li>
              <a href={`mailto:${email}`} className="hover:text-brand-fg">
                {email}
              </a>
            </li>
            <li className="pt-1 leading-relaxed">
              CNPJ 54.801.401/0001-70
              <br />
              ONERIO PASS INGRESSOS E ACESSOS LTDA
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Social
          </h2>
          <div className="mt-4 flex gap-3">
            <a
              href="https://instagram.com/onerio.pass"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-fg/10 text-brand-muted transition-colors hover:bg-brand-muted hover:text-white"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61557473965505"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-fg/10 text-brand-muted transition-colors hover:bg-brand-muted hover:text-white"
              aria-label="Facebook"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a
              href={`https://wa.me/55${waDigits}?text=${encodeURIComponent("Olá, vim pelo site da OneRio")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-fg/10 text-brand-muted transition-colors hover:bg-brand-muted hover:text-white"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-dotted border-brand-fg/25 py-5">
        <p className="container text-center text-xs text-brand-fg/60 md:text-left">
          OneRio {new Date().getFullYear()} - Todos os Direitos Reservados - CNPJ
          54.801.401/0001-70 - ONERIO PASS INGRESSOS E ACESSOS LTDA
        </p>
      </div>
    </footer>
  );
}
