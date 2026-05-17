"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ShieldCheck, ShieldAlert } from "lucide-react";
import { Input, TableRowSkeleton } from "@/components/atoms";
import { api } from "@/lib/api-client";
import { formatBnDate } from "@/lib/orders-store";
import { toBengaliNumber } from "@/lib/site";

interface Row {
  id: string;
  email: string;
  name: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: number;
  orderCount: number;
  revenue: number;
}

export function AdminCustomersList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    const r = await api.adminCustomers(q || undefined);
    if (r.ok) setRows(r.data.customers as Row[]);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-[var(--fg-primary)]">কাস্টমার</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">
          {toBengaliNumber(rows.length)} জন কাস্টমার দেখানো হচ্ছে।
        </p>
      </div>

      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-card">
        <Input
          placeholder="ইমেইল / নাম / ফোন"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {loading ? (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-x-auto shadow-card">
          <table className="w-full text-body-sm">
            <tbody className="divide-y divide-[var(--border-muted)]">
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={6} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-x-auto shadow-card">
          <table className="w-full text-body-sm">
            <thead className="bg-[var(--bg-surface-muted)] text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              <tr>
                <th className="text-left px-4 py-3">কাস্টমার</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">ফোন</th>
                <th className="text-center px-4 py-3">ভেরিফাইড</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">জয়েনিং</th>
                <th className="text-center px-4 py-3">অর্ডার</th>
                <th className="text-right px-4 py-3">রেভিনিউ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--bg-surface-muted)]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--fg-primary)] truncate max-w-[200px]">
                      {r.name}
                    </p>
                    <p className="text-caption text-[var(--fg-muted)] truncate max-w-[200px]">
                      {r.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[var(--fg-secondary)]">
                    {r.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.emailVerified ? (
                      <ShieldCheck size={16} className="inline text-success-600" />
                    ) : (
                      <ShieldAlert size={16} className="inline text-warning-600" />
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-[var(--fg-secondary)]">
                    {formatBnDate(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-[var(--fg-secondary)]">
                    {toBengaliNumber(r.orderCount)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[var(--fg-primary)] tabular-nums">
                    {toBengaliNumber(r.revenue.toLocaleString("en-US"))}৳
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
