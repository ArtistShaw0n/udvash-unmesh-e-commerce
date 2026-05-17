"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { StarRating } from "@/components/atoms";
import { api } from "@/lib/api-client";
import { formatBnDate } from "@/lib/orders-store";
import { toBengaliNumber } from "@/lib/site";

interface Row {
  id: string;
  slug: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: number;
  verifiedPurchase: boolean;
}

export function AdminReviewsList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.adminReviews().then((r) => {
      if (r.ok) setRows(r.data.reviews as Row[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-[var(--fg-primary)]">রিভিউ</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">
          {toBengaliNumber(rows.length)} টি রিভিউ।
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center text-body-sm text-[var(--fg-muted)]">
          লোড হচ্ছে...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center text-body-sm text-[var(--fg-muted)]">
          এখনও কোন রিভিউ নেই
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[var(--fg-primary)]">
                      {r.authorName}
                    </span>
                    {r.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-success-100 text-success-800 dark:bg-success-700/30 dark:text-success-300 text-caption font-bold">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-caption text-[var(--fg-muted)] mt-1">
                    <Link
                      href={`/products/${r.slug}`}
                      className="font-mono hover:underline"
                    >
                      {r.slug}
                    </Link>
                    {" · "}
                    {formatBnDate(r.createdAt)}
                  </p>
                </div>
                <StarRating value={r.rating} size={14} />
              </div>
              {r.title && r.title !== "—" && (
                <p className="text-body-sm font-semibold text-[var(--fg-primary)] mt-3">
                  {r.title}
                </p>
              )}
              <p className="text-body-sm text-[var(--fg-secondary)] mt-2 leading-relaxed">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
