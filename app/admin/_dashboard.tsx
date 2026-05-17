"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  IndianRupee,
  Package,
  RotateCcw,
  Users,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { toBengaliNumber } from "@/lib/site";

interface Stats {
  ordersTotal: number;
  ordersToday: number;
  revenueAll: number;
  revenueToday: number;
  customersTotal: number;
  customersThisWeek: number;
  pendingReturns: number;
  lowStockCount: number;
  byStatus: Record<string, number>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api.adminStats().then((r) => {
      if (r.ok) setStats(r.data.stats as unknown as Stats);
      else setError(r.error);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-[var(--fg-primary)]">ড্যাশবোর্ড</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">
          আজকের পারফরম্যান্স ও সমগ্রিক স্ট্যাটাস।
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-discount-50 dark:bg-discount-900/20 border border-discount-200 dark:border-discount-700/40 px-4 py-3 text-body-sm text-discount-800 dark:text-discount-200">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="মোট রেভিনিউ"
          value={stats ? `৳${toBengaliNumber(stats.revenueAll.toLocaleString("en-US"))}` : "—"}
          sub={
            stats
              ? `আজ ৳${toBengaliNumber(stats.revenueToday.toLocaleString("en-US"))}`
              : undefined
          }
          icon={<IndianRupee size={20} />}
          tone="success"
        />
        <KpiCard
          label="মোট অর্ডার"
          value={stats ? toBengaliNumber(stats.ordersTotal) : "—"}
          sub={stats ? `আজ ${toBengaliNumber(stats.ordersToday)}` : undefined}
          icon={<Package size={20} />}
          tone="brand"
        />
        <KpiCard
          label="মোট কাস্টমার"
          value={stats ? toBengaliNumber(stats.customersTotal) : "—"}
          sub={stats ? `এই সপ্তাহে ${toBengaliNumber(stats.customersThisWeek)}` : undefined}
          icon={<Users size={20} />}
          tone="warning"
        />
        <KpiCard
          label="পেন্ডিং রিটার্ন"
          value={stats ? toBengaliNumber(stats.pendingReturns) : "—"}
          sub={
            stats && stats.lowStockCount > 0
              ? `স্টক কম: ${toBengaliNumber(stats.lowStockCount)} বই`
              : undefined
          }
          icon={<RotateCcw size={20} />}
          tone="discount"
        />
      </div>

      {/* Status breakdown */}
      {stats && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
          <h2 className="text-h3 text-[var(--fg-primary)]">অর্ডার স্ট্যাটাস ব্রেকডাউন</h2>
          <div className="grid gap-3 sm:grid-cols-5 mt-4">
            {(["placed", "confirmed", "shipped", "delivered", "cancelled"] as const).map(
              (status) => {
                const labels = {
                  placed: "অর্ডার করা",
                  confirmed: "নিশ্চিত",
                  shipped: "প্রেরিত",
                  delivered: "ডেলিভার্ড",
                  cancelled: "বাতিল",
                };
                const tones: Record<string, string> = {
                  placed: "bg-neutral-100 text-neutral-700",
                  confirmed: "bg-brand-50 text-brand-700",
                  shipped: "bg-warning-50 text-warning-800",
                  delivered: "bg-success-50 text-success-700",
                  cancelled: "bg-discount-50 text-discount-700",
                };
                return (
                  <div
                    key={status}
                    className={`rounded-md px-4 py-3 ${tones[status]} dark:bg-[var(--bg-surface-muted)] dark:text-[var(--fg-primary)]`}
                  >
                    <p className="text-caption font-bold uppercase tracking-wider">
                      {labels[status]}
                    </p>
                    <p className="text-h3 font-bold mt-1 tabular-nums">
                      {toBengaliNumber(stats.byStatus[status] ?? 0)}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Low stock alert */}
      {stats && stats.lowStockCount > 0 && (
        <div className="rounded-lg bg-warning-50 dark:bg-warning-700/15 border border-warning-200 dark:border-warning-700/40 p-4 flex items-start gap-3">
          <AlertTriangle
            size={20}
            className="text-warning-700 dark:text-warning-300 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-body font-semibold text-warning-800 dark:text-warning-200">
              স্টক কম
            </p>
            <p className="text-body-sm text-warning-700 dark:text-warning-300 mt-0.5">
              {toBengaliNumber(stats.lowStockCount)} টি বইয়ের স্টক ৫ এর কম। ইনভেন্টরি পেজে চেক করুন।
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone: "brand" | "success" | "warning" | "discount";
}) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300",
    success:
      "bg-success-50 text-success-700 dark:bg-success-700/20 dark:text-success-300",
    warning:
      "bg-warning-50 text-warning-700 dark:bg-warning-700/20 dark:text-warning-300",
    discount:
      "bg-discount-50 text-discount-700 dark:bg-discount-700/20 dark:text-discount-300",
  };
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
          {label}
        </p>
        <span
          className={`inline-flex w-9 h-9 items-center justify-center rounded-md ${toneClasses[tone]}`}
        >
          {icon}
        </span>
      </div>
      <p className="text-h2 font-bold text-[var(--fg-primary)] mt-3 tabular-nums">
        {value}
      </p>
      {sub && <p className="text-caption text-[var(--fg-muted)] mt-1">{sub}</p>}
    </div>
  );
}
