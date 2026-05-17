"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button, Input } from "@/components/atoms";
import { api } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { toBengaliNumber } from "@/lib/site";
import { clsx } from "@/lib/clsx";

interface Row {
  slug: string;
  title: string;
  titleBn: string;
  category: string;
  catalogStock: "in-stock" | "preorder" | "out-of-stock";
  units: number;
}

function statusOf(r: Row): "in-stock" | "low-stock" | "out-of-stock" | "preorder" {
  if (r.catalogStock === "preorder") return "preorder";
  if (r.units <= 0) return "out-of-stock";
  if (r.units <= 5) return "low-stock";
  return "in-stock";
}

const TONE: Record<string, string> = {
  "in-stock": "bg-success-50 text-success-700 dark:bg-success-700/20 dark:text-success-300",
  "low-stock": "bg-warning-50 text-warning-700 dark:bg-warning-700/20 dark:text-warning-300",
  "out-of-stock":
    "bg-discount-50 text-discount-700 dark:bg-discount-700/20 dark:text-discount-300",
  preorder: "bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300",
};

export function AdminInventoryEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    void api.adminInventory().then((r) => {
      if (r.ok) setRows(r.data.inventory as Row[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(needle) ||
        r.titleBn.includes(q) ||
        r.slug.toLowerCase().includes(needle) ||
        r.category.toLowerCase().includes(needle),
    );
  }, [rows, q]);

  async function save(slug: string) {
    const units = edits[slug];
    if (units == null || Number.isNaN(units)) return;
    setSavingSlug(slug);
    const r = await api.adminSetInventory(slug, units);
    setSavingSlug(null);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setRows((prev) =>
      prev.map((row) => (row.slug === slug ? { ...row, units: r.data.units } : row)),
    );
    setEdits((prev) => {
      const next = { ...prev };
      delete next[slug];
      return next;
    });
    toast.success("ইনভেন্টরি আপডেট হয়েছে");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 text-[var(--fg-primary)]">ইনভেন্টরি</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">
          প্রতিটি SKU-এর বর্তমান স্টক ম্যানেজ করুন।
        </p>
      </div>

      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-card">
        <Input
          placeholder="বই বা ক্যাটেগরি দিয়ে সার্চ"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {loading ? (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center text-body-sm text-[var(--fg-muted)]">
          লোড হচ্ছে...
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-x-auto shadow-card">
          <table className="w-full text-body-sm">
            <thead className="bg-[var(--bg-surface-muted)] text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              <tr>
                <th className="text-left px-4 py-3">বই</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">ক্যাটেগরি</th>
                <th className="text-center px-4 py-3">স্ট্যাটাস</th>
                <th className="text-center px-4 py-3">ইউনিট</th>
                <th className="text-center px-4 py-3">Set</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {filtered.map((r) => {
                const status = statusOf(r);
                const pending = edits[r.slug] != null && edits[r.slug] !== r.units;
                const saving = savingSlug === r.slug;
                return (
                  <tr key={r.slug}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[var(--fg-primary)] truncate max-w-[280px]">
                        {r.titleBn}
                      </p>
                      <p className="text-caption text-[var(--fg-muted)] font-mono truncate max-w-[280px]">
                        {r.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[var(--fg-secondary)]">
                      {r.category}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={clsx(
                          "inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-bold",
                          TONE[status],
                        )}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-[var(--fg-primary)] tabular-nums">
                      {toBengaliNumber(r.units)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min={0}
                        max={9999}
                        defaultValue={r.units}
                        onChange={(e) =>
                          setEdits((p) => ({ ...p, [r.slug]: Number(e.target.value) }))
                        }
                        className="w-20 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1.5 text-body-sm text-center tabular-nums"
                      />
                    </td>
                    <td className="px-2 py-3 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => save(r.slug)}
                        disabled={!pending || saving}
                      >
                        {saving ? "..." : "Save"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
