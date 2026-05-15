import { Package, Heart, MapPin, User } from "lucide-react";
import Link from "next/link";
import { ArrowLink } from "@/components/atoms";
import { OrderCard } from "@/components/molecules";
import type { OrderSummary } from "@/components/molecules";

export const metadata = { title: "আমার ড্যাশবোর্ড" };

const RECENT_ORDERS: OrderSummary[] = [
  { id: "UU892145", placedAt: "১৬ মে, ২০২৬", itemCount: 2, total: 2350, status: "confirmed" },
  { id: "UU881903", placedAt: "১০ মে, ২০২৬", itemCount: 1, total: 450, status: "delivered" },
];

const STAT_CARDS = [
  { label: "মোট অর্ডার", value: "৮", icon: Package, href: "/account/orders" },
  { label: "উইশলিস্ট", value: "৩", icon: Heart, href: "/account/wishlist" },
  { label: "ঠিকানা", value: "২", icon: MapPin, href: "/account/addresses" },
];

export default function AccountDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="rounded-lg bg-brand-700 text-white p-6 sm:p-8">
        <p className="text-body-sm text-white/80">স্বাগতম 👋</p>
        <h1 className="text-h2 mt-1">Shawon Ahmed</h1>
        <p className="text-body-sm text-white/85 mt-2 flex items-center gap-2">
          <User size={14} /> uiux1.opl@gmail.com
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 hover:border-brand-300 hover:shadow-card-hover transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex w-11 h-11 items-center justify-center rounded-md bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">{label}</p>
                <p className="text-h3 font-bold text-[var(--fg-primary)]">{value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-h3 text-[var(--fg-primary)]">সাম্প্রতিক অর্ডার</h2>
          <ArrowLink href="/account/orders">সব দেখুন</ArrowLink>
        </div>
        <div className="space-y-3">
          {RECENT_ORDERS.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      </div>
    </div>
  );
}
