import type { Metadata } from "next";
import "./globals.css";
import { getCurrentSite, siteThemeVars } from "@/features/tenant/server";
import { ONERIO_VOICE } from "@/features/tenant/voice";
import { getServerSession } from "@/features/auth/server";
import { AuthProvider } from "@/features/auth/auth-provider";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCurrentSite();
  return {
    title: {
      default: `${site.name} — ${ONERIO_VOICE.tagline.replace(/\.$/, "")}`,
      template: `%s · ${site.name}`,
    },
    description: ONERIO_VOICE.metaDescription,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, session] = await Promise.all([
    getCurrentSite(),
    getServerSession(),
  ]);
  return (
    <html lang="pt-BR" style={siteThemeVars(site)}>
      <body className="font-sans">
        <AuthProvider initialRole={session?.role ?? null}>{children}</AuthProvider>
      </body>
    </html>
  );
}
