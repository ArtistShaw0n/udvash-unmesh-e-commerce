import { AccountGuard, AccountSidebar } from "@/components/organisms";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="section-pad-sm">
      <div className="container-site grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] lg:items-start min-w-0 [&>*]:min-w-0">
        <AccountSidebar />
        <div className="min-w-0">
          <AccountGuard>{children}</AccountGuard>
        </div>
      </div>
    </section>
  );
}
