import { getCurrentSite } from "@/features/tenant/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getCurrentSite();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader site={site} />
      <main className="flex-1">{children}</main>
      <SiteFooter site={site} />
    </div>
  );
}
