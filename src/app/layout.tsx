import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { getCurrentSite, siteThemeVars } from "@/features/tenant/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCurrentSite();
  return {
    title: { default: `${site.name} — Ingressos e Passaportes`, template: `%s · ${site.name}` },
    description: "Ingressos, experiências e passaportes turísticos com a melhor experiência de compra.",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getCurrentSite();
  return (
    <html lang="pt-BR" style={siteThemeVars(site)} className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
