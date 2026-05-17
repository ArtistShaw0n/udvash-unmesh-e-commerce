import type { Metadata } from "next";
import { AdminGuard, AdminSidebar } from "@/components/admin";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · উদ্ভাস-উন্মেষ" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen flex bg-[var(--bg-page)]">
        <AdminSidebar />
        <div className="flex-1 min-w-0 lg:ml-64">
          <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
