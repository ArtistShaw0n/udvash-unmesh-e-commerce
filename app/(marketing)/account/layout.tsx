import { AccountGuard, AccountSidebar } from "@/components/organisms";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="section-pad-sm">
      <div className="container-site grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
        <AccountSidebar />
        <div className="min-w-0">
          <AccountGuard>{children}</AccountGuard>
        </div>
      </div>
    </section>
  );
}
