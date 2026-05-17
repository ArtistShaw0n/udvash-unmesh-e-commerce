"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatBnDate } from "@/lib/orders-store";
import { toBengaliNumber } from "@/lib/site";

interface Row {
  id: string;
  placedAt: number;
  returnStatus: string;
  returnReason?: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{ slug: string; quantity: number }>;
}

const STATUS_TONE: Record<string, string> = {
  requested:
    "bg-warning-100 text-warning-800 dark:bg-warning-700/30 dark:text-warning-300",
  approved: "bg-brand-100 text-brand-800 dark:bg-brand-700/30 dark:text-brand-300",
  "picked-up":
    "bg-brand-100 text-brand-800 dark:bg-brand-700/30 dark:text-brand-300",
  refunded: "bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-300",
  rejected:
    "bg-discount-100 text-discount-700 dark:bg-discount-700/30 dark:text-discount-300",
};

export function AdminReturnsList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.adminReturns().then((r) => {
      if (r.ok) setRows(r.data.returns as Row[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-[var(--fg-primary)]">রিটার্ন রিকোয়েস্ট</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">
          {toBengaliNumber(rows.length)} টি রিটার্ন।
        </p>
      </div>

      {loading ? (
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center text-body-sm text-[var(--fg-muted)]">
          লোড হচ্ছে...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center text-body-sm text-[var(--fg-muted)]">
          কোন রিটার্ন রিকোয়েস্ট নেই
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/admin/orders/${r.id}`}
              className="block rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-body-sm text-[var(--fg-primary)]">
                      #{r.id}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-bold ${
                        STATUS_TONE[r.returnStatus] ?? STATUS_TONE.requested
                      }`}
                    >
                      {r.returnStatus}
                    </span>
                  </div>
                  <p className="text-body-sm text-[var(--fg-secondary)] mt-1">
                    {r.customerName} · {r.customerEmail}
                  </p>
                  <p className="text-caption text-[var(--fg-muted)] mt-0.5">
                    {formatBnDate(r.placedAt)} · {toBengaliNumber(r.items.length)} item(s)
                  </p>
                  {r.returnReason && (
                    <p className="text-body-sm text-[var(--fg-secondary)] mt-2 italic">
                      &ldquo;{r.returnReason}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[var(--fg-primary)] tabular-nums">
                    {toBengaliNumber(r.total.toLocaleString("en-US"))}৳
                  </span>
                  <ChevronRight size={18} className="text-[var(--fg-muted)]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
