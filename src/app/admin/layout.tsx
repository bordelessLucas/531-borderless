import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = { title: "Backoffice OneRio" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-subtle">
      <div className="mx-auto flex max-w-[1400px]">
        <AdminSidebar />
        <div className="flex-1 px-6 py-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}
