"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { Input, TableRowSkeleton } from "@/components/atoms";
import { api } from "@/lib/api-client";
import { formatBnDate, type OrderStatus } from "@/lib/orders-store";
import { toBengaliNumber } from "@/lib/site";

interface AdminOrderRow {
  id: string;
  placedAt: number;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{ slug: string; quantity: number }>;
}

const STATUSES: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "সব" },
  { value: "placed", label: "অর্ডার করা" },
  { value: "confirmed", label: "নিশ্চিত" },
  { value: "shipped", label: "প্রেরিত" },
  { value: "delivered", label: "ডেলিভার্ড" },
  { value: "cancelled", label: "বাতিল" },
];

const STATUS_TONE: Record<OrderStatus, string> = {
  placed: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
  confirmed: "bg-brand-100 text-brand-800 dark:bg-brand-700/30 dark:text-brand-300",
  shipped: "bg-warning-100 text-warning-800 dark:bg-warning-700/30 dark:text-warning-300",
  delivered: "bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-300",
  cancelled: "bg-discount-100 text-discount-700 dark:bg-discount-700/30 dark:text-discount-300",
};

export function AdminOrdersList() {
  const [rows, setRows] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [q, setQ] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const r = await api.adminOrders({ status: status || undefined, q: q || undefined });
    if (r.ok) setRows(r.data.orders as AdminOrderRow[]);
    setLoading(false);
  }, [status, q]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-[var(--fg-primary)]">অর্ডার ম্যানেজমেন্ট</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">
          {toBengaliNumber(rows.length)} টি অর্ডার দেখানো হচ্ছে।
        </p>
      </div>

      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-card flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="অর্ডার আইডি / ইমেইল / নাম / ফোন দিয়ে খুঁজুন"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
          className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-body-sm"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-card">
          <table className="w-full text-body-sm">
            <tbody className="divide-y divide-[var(--border-muted)]">
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={7} />
              ))}
            </tbody>
          </table>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center text-body-sm text-[var(--fg-muted)]">
          কোন অর্ডার পাওয়া যায়নি
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-card">
          <table className="w-full text-body-sm">
            <thead className="bg-[var(--bg-surface-muted)] text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">তারিখ</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">কাস্টমার</th>
                <th className="text-center px-4 py-3">Items</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--bg-surface-muted)]">
                  <td className="px-4 py-3 font-mono text-body-sm font-semibold text-[var(--fg-primary)]">
                    #{o.id}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-[var(--fg-secondary)]">
                    {formatBnDate(o.placedAt)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-[var(--fg-primary)] truncate max-w-[180px]">
                      {o.customerName}
                    </p>
                    <p className="text-caption text-[var(--fg-muted)] truncate max-w-[180px]">
                      {o.customerEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-[var(--fg-secondary)]">
                    {toBengaliNumber(o.items.reduce((s, i) => s + i.quantity, 0))}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[var(--fg-primary)] tabular-nums">
                    {toBengaliNumber(o.total.toLocaleString("en-US"))}৳
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-bold ${STATUS_TONE[o.status]}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--fg-muted)] hover:text-brand-700 hover:bg-[var(--bg-surface)]"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
