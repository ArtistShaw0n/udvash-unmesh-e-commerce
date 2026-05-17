"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { api } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { toBengaliNumber } from "@/lib/site";
import type { Coupon, CouponKind } from "@/lib/coupons";
import { clsx } from "@/lib/clsx";

const KIND_LABEL: Record<CouponKind, string> = {
  percent: "% off",
  fixed: "Fixed ৳ off",
  "free-shipping": "Free shipping",
};

const KIND_TONE: Record<CouponKind, string> = {
  percent: "bg-brand-100 text-brand-800 dark:bg-brand-700/30 dark:text-brand-300",
  fixed: "bg-warning-100 text-warning-800 dark:bg-warning-700/30 dark:text-warning-300",
  "free-shipping":
    "bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-300",
};

interface Form {
  code: string;
  kind: CouponKind;
  value: string;
  minSubtotal: string;
  maxDiscount: string;
  description: string;
  successLabel: string;
}

const EMPTY: Form = {
  code: "",
  kind: "percent",
  value: "10",
  minSubtotal: "",
  maxDiscount: "",
  description: "",
  successLabel: "",
};

export function AdminCouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null);
  const toast = useToast();

  async function load() {
    setLoading(true);
    const r = await api.adminCoupons();
    if (r.ok) setCoupons(r.data.coupons as Coupon[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setCreating(true);
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    setForm({
      code: c.code,
      kind: c.kind,
      value: String(c.value),
      minSubtotal: c.minSubtotal != null ? String(c.minSubtotal) : "",
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
      description: c.description,
      successLabel: c.successLabel,
    });
    setCreating(true);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  async function save() {
    const body: Record<string, unknown> = {
      code: form.code,
      kind: form.kind,
      value: Number(form.value),
      description: form.description,
      successLabel: form.successLabel,
    };
    if (form.minSubtotal) body.minSubtotal = Number(form.minSubtotal);
    if (form.maxDiscount) body.maxDiscount = Number(form.maxDiscount);

    const r = editing
      ? await api.adminUpdateCoupon(editing.code, body)
      : await api.adminCreateCoupon(body);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success(editing ? "কুপন আপডেট হয়েছে" : "কুপন যোগ হয়েছে");
    closeForm();
    void load();
  }

  async function doDelete() {
    if (!confirmDelete) return;
    const r = await api.adminDeleteCoupon(confirmDelete.code);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("কুপন মুছে ফেলা হয়েছে");
    setConfirmDelete(null);
    void load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-h1 text-[var(--fg-primary)]">কুপন</h1>
          <p className="text-body text-[var(--fg-secondary)] mt-1">
            {toBengaliNumber(coupons.length)} টি কুপন।
          </p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={openCreate}>
          নতুন কুপন
        </Button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center text-body-sm text-[var(--fg-muted)]">
          লোড হচ্ছে...
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center text-body-sm text-[var(--fg-muted)]">
          এখনও কোন কুপন নেই
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-x-auto shadow-card">
          <table className="w-full text-body-sm">
            <thead className="bg-[var(--bg-surface-muted)] text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Kind</th>
                <th className="text-right px-4 py-3">Value</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Min</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Cap</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Description</th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {coupons.map((c) => (
                <tr key={c.code}>
                  <td className="px-4 py-3 font-mono font-semibold text-[var(--fg-primary)]">
                    {c.code}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-bold",
                        KIND_TONE[c.kind],
                      )}
                    >
                      {KIND_LABEL[c.kind]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--fg-primary)] font-semibold">
                    {c.kind === "percent"
                      ? `${c.value}%`
                      : c.kind === "fixed"
                      ? `৳${c.value}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--fg-secondary)] hidden sm:table-cell">
                    {c.minSubtotal ? `৳${c.minSubtotal}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--fg-secondary)] hidden sm:table-cell">
                    {c.maxDiscount ? `৳${c.maxDiscount}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--fg-secondary)] hidden lg:table-cell max-w-xs truncate">
                    {c.description}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="px-2 py-1 rounded-md text-caption font-semibold text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-muted)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(c)}
                        aria-label="Delete coupon"
                        className="w-8 h-8 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-discount-50 hover:text-discount-600 dark:hover:bg-discount-900/30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit modal */}
      {creating && (
        <Modal title={editing ? `Edit ${editing.code}` : "নতুন কুপন"} onClose={closeForm}>
          <FormField
            id="cp-code"
            label="Code (uppercase A-Z, 0-9, -, _)"
            placeholder="NEW10"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            disabled={!!editing}
          />
          <div className="space-y-1.5">
            <label className="block text-body-sm font-semibold text-[var(--fg-primary)]">
              Kind
            </label>
            <select
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as CouponKind })}
              className="w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2.5 text-body"
            >
              <option value="percent">% off</option>
              <option value="fixed">Fixed ৳ off</option>
              <option value="free-shipping">Free shipping</option>
            </select>
          </div>
          <FormField
            id="cp-value"
            label={form.kind === "percent" ? "Percent (e.g. 10)" : form.kind === "fixed" ? "Amount in ৳" : "Value (set 0)"}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            type="number"
          />
          <FormField
            id="cp-min"
            label="Minimum subtotal (৳) — optional"
            value={form.minSubtotal}
            onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })}
            type="number"
          />
          {form.kind === "percent" && (
            <FormField
              id="cp-cap"
              label="Maximum discount cap (৳) — optional"
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
              type="number"
            />
          )}
          <FormField
            id="cp-desc"
            label="Description (shown to customers)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="১০% ছাড়, মিনিমাম ৫০০৳"
          />
          <FormField
            id="cp-success"
            label="Success label (toast)"
            value={form.successLabel}
            onChange={(e) => setForm({ ...form, successLabel: e.target.value })}
            placeholder="১০% ছাড় প্রযোজ্য হয়েছে"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={closeForm}>
              বাতিল
            </Button>
            <Button variant="primary" onClick={save}>
              সেভ
            </Button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title={`Delete ${confirmDelete.code}?`} onClose={() => setConfirmDelete(null)}>
          <p className="text-body-sm text-[var(--fg-secondary)]">
            <span className="font-mono font-semibold text-[var(--fg-primary)]">
              {confirmDelete.code}
            </span>{" "}
            কুপনটি মুছে ফেলা হবে। এটি ফিরিয়ে আনা যাবে না।
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              বাতিল
            </Button>
            <Button variant="danger" onClick={doDelete}>
              মুছে ফেলুন
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-card-hover p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-h3 text-[var(--fg-primary)]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--bg-surface-muted)]"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
