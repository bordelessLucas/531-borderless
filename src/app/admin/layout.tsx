import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminGuard } from "@/components/admin/admin-guard";

export const metadata: Metadata = { title: "Backoffice OneRio" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="mx-auto flex max-w-[1400px]">
        <AdminSidebar />
        <div className="flex-1 px-6 py-8 lg:px-10">
          <AdminGuard>{children}</AdminGuard>
        </div>
      </div>
    </div>
  );
}
