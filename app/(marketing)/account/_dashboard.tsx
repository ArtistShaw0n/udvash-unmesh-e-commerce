"use client";

import Link from "next/link";
import { Package, Heart, MapPin, User, MailCheck, MailWarning } from "lucide-react";
import { ArrowLink, Button } from "@/components/atoms";
import { EmptyState, OrderCard, type OrderSummary } from "@/components/molecules";
import { useAuth } from "@/lib/auth-context";
import { useOrders, formatBnDate } from "@/lib/orders-store";
import { useWishlist } from "@/lib/wishlist-context";
import { toBengaliNumber } from "@/lib/site";

export function AccountDashboard() {
  const { user } = useAuth();
  const { ordersFor } = useOrders();
  const { count: wishlistCount } = useWishlist();

  if (!user) return null;

  const myOrders = ordersFor(user.email);
  const recentOrders: OrderSummary[] = myOrders.slice(0, 3).map((o) => ({
    id: o.id,
    placedAt: formatBnDate(o.placedAt),
    itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
    total: o.total,
    status: o.status,
  }));

  const stats = [
    { label: "মোট অর্ডার", value: toBengaliNumber(myOrders.length), icon: Package, href: "/account/orders" },
    { label: "উইশলিস্ট", value: toBengaliNumber(wishlistCount), icon: Heart, href: "/account/wishlist" },
    { label: "ঠিকানা", value: toBengaliNumber(user.addresses.length), icon: MapPin, href: "/account/addresses" },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="rounded-lg bg-brand-700 text-white p-6 sm:p-8">
        <p className="text-body-sm text-white/80">স্বাগতম 👋</p>
        <h1 className="text-h2 mt-1">{user.name}</h1>
        <p className="text-body-sm text-white/85 mt-2 flex items-center gap-2">
          <User size={14} /> {user.email}
        </p>
      </div>

      {/* Verify email banner */}
      {!user.emailVerified && (
        <div className="rounded-lg bg-warning-50 dark:bg-warning-700/15 border border-warning-200 dark:border-warning-700/30 p-4 flex items-start gap-3">
          <MailWarning size={22} className="text-warning-700 dark:text-warning-300 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-body font-semibold text-warning-800 dark:text-warning-200">
              ইমেইল ভেরিফাই করুন
            </p>
            <p className="text-body-sm text-warning-700 dark:text-warning-300 mt-0.5">
              চেকআউট করতে আপনার ইমেইল ভেরিফাই করা জরুরি।
            </p>
          </div>
          <Button href="/verify-email" variant="warning" size="sm">
            ভেরিফাই করুন
          </Button>
        </div>
      )}
      {user.emailVerified && (
        <div className="rounded-lg bg-success-50 dark:bg-success-700/15 border border-success-200 dark:border-success-700/30 p-3 flex items-center gap-2">
          <MailCheck size={18} className="text-success-700 dark:text-success-400" />
          <p className="text-body-sm text-success-800 dark:text-success-200">
            ইমেইল ভেরিফাইড
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
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
                <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  {label}
                </p>
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
          {recentOrders.length > 0 && (
            <ArrowLink href="/account/orders">সব দেখুন</ArrowLink>
          )}
        </div>
        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        ) : (
          <EmptyState
            icon={<Package size={32} />}
            title="এখনো কোন অর্ডার নেই"
            description="কেনাকাটা শুরু করে আপনার প্রথম অর্ডার দিন।"
            cta={<Button href="/products" variant="primary">বই দেখুন</Button>}
            className="!py-8"
          />
        )}
      </div>
    </div>
  );
}
