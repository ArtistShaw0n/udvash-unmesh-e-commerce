"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Truck, Check, X } from "lucide-react";
import { Button } from "@/components/atoms";
import { api } from "@/lib/api-client";
import { formatBnDate, type OrderStatus } from "@/lib/orders-store";
import { useToast } from "@/lib/toast-context";
import { toBengaliNumber } from "@/lib/site";

interface AdminOrder {
  id: string;
  placedAt: number;
  status: OrderStatus;
  items: Array<{ slug: string; quantity: number; price: number; titleBn: string }>;
  address: {
    recipientName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    zip?: string;
  };
  payment: { method: string; status: string };
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  couponCode?: string;
  returnStatus: string;
  cancelReason?: string;
  returnReason?: string;
}

interface AdminCustomer {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

const NEXT_STATUS: Record<OrderStatus, { value: OrderStatus; label: string; icon: React.ReactNode }[]> = {
  placed: [
    { value: "confirmed", label: "নিশ্চিত করুন", icon: <Check size={14} /> },
    { value: "cancelled", label: "বাতিল করুন", icon: <X size={14} /> },
  ],
  confirmed: [
    { value: "shipped", label: "প্রেরিত হিসেবে চিহ্নিত", icon: <Truck size={14} /> },
    { value: "cancelled", label: "বাতিল করুন", icon: <X size={14} /> },
  ],
  shipped: [
    { value: "delivered", label: "ডেলিভার্ড হিসেবে চিহ্নিত", icon: <Check size={14} /> },
  ],
  delivered: [],
  cancelled: [],
};

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [busy, setBusy] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const toast = useToast();

  const refresh = useCallback(async () => {
    const r = await api.adminGetOrder(orderId);
    if (!r.ok) {
      if (r.status === 404) setNotFound(true);
      return;
    }
    setOrder(r.data.order as AdminOrder);
    setCustomer(r.data.customer as AdminCustomer | null);
  }, [orderId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function updateStatus(next: OrderStatus) {
    if (!order) return;
    setBusy(true);
    const r = await api.adminUpdateOrder(order.id, { status: next });
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success(`Status → ${next}`);
    await refresh();
  }

  async function updateReturnStatus(next: string) {
    if (!order) return;
    setBusy(true);
    const r = await api.adminUpdateOrder(order.id, { returnStatus: next });
    setBusy(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success(`Return → ${next}`);
    await refresh();
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700"
        >
          <ChevronLeft size={16} /> অর্ডার লিস্টে ফিরে যান
        </Link>
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center text-body-sm text-[var(--fg-muted)]">
          অর্ডার পাওয়া যায়নি
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center text-body-sm text-[var(--fg-muted)]">
        লোড হচ্ছে...
      </div>
    );
  }

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const nextSteps = NEXT_STATUS[order.status];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700"
      >
        <ChevronLeft size={16} /> অর্ডার লিস্টে ফিরে যান
      </Link>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-h1 text-[var(--fg-primary)] font-mono">#{order.id}</h1>
          <p className="text-body text-[var(--fg-secondary)] mt-1">
            {formatBnDate(order.placedAt)} · {toBengaliNumber(itemCount)} items
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {nextSteps.map((s) => (
            <Button
              key={s.value}
              variant={s.value === "cancelled" ? "danger" : "primary"}
              size="md"
              leftIcon={s.icon}
              onClick={() => updateStatus(s.value)}
              disabled={busy}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Return workflow buttons */}
      {order.returnStatus !== "none" && (
        <div className="rounded-md bg-warning-50 dark:bg-warning-700/15 border border-warning-200 dark:border-warning-700/40 p-4 space-y-3">
          <div>
            <p className="text-caption font-bold uppercase tracking-wider text-warning-800 dark:text-warning-300">
              রিটার্ন রিকোয়েস্ট ({order.returnStatus})
            </p>
            {order.returnReason && (
              <p className="text-body-sm text-warning-700 dark:text-warning-300 mt-1">
                কারণ: {order.returnReason}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {order.returnStatus === "requested" && (
              <>
                <Button variant="primary" size="sm" onClick={() => updateReturnStatus("approved")}>
                  অনুমোদন
                </Button>
                <Button variant="danger" size="sm" onClick={() => updateReturnStatus("rejected")}>
                  প্রত্যাখ্যান
                </Button>
              </>
            )}
            {order.returnStatus === "approved" && (
              <Button variant="primary" size="sm" onClick={() => updateReturnStatus("picked-up")}>
                পিকআপ সম্পন্ন
              </Button>
            )}
            {order.returnStatus === "picked-up" && (
              <Button variant="primary" size="sm" onClick={() => updateReturnStatus("refunded")}>
                রিফান্ড সম্পন্ন (+ স্টক রিস্টোর)
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Items */}
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
            <h2 className="text-h3 text-[var(--fg-primary)] mb-4">অর্ডারকৃত বইসমূহ</h2>
            <table className="w-full text-body-sm">
              <thead className="text-caption uppercase tracking-wider text-[var(--fg-muted)]">
                <tr>
                  <th className="text-left pb-2">বই</th>
                  <th className="text-center pb-2">Qty</th>
                  <th className="text-right pb-2">Price</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-muted)]">
                {order.items.map((it) => (
                  <tr key={it.slug}>
                    <td className="py-2.5 text-[var(--fg-primary)]">{it.titleBn}</td>
                    <td className="text-center tabular-nums text-[var(--fg-secondary)]">
                      {toBengaliNumber(it.quantity)}
                    </td>
                    <td className="text-right tabular-nums text-[var(--fg-secondary)]">
                      {toBengaliNumber(it.price.toLocaleString("en-US"))}৳
                    </td>
                    <td className="text-right tabular-nums font-bold text-[var(--fg-primary)]">
                      {toBengaliNumber((it.price * it.quantity).toLocaleString("en-US"))}৳
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Address */}
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
            <h2 className="text-h3 text-[var(--fg-primary)] mb-3">শিপিং ঠিকানা</h2>
            <p className="text-body-sm text-[var(--fg-secondary)] leading-relaxed">
              <span className="font-semibold text-[var(--fg-primary)]">{order.address.recipientName}</span> · {order.address.phone}
              <br />
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}
              {order.address.zip ? ` — ${order.address.zip}` : ""}
            </p>
          </div>
        </div>

        {/* Summary */}
        <aside className="space-y-4">
          {customer && (
            <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-card">
              <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                কাস্টমার
              </p>
              <p className="text-body font-semibold text-[var(--fg-primary)] mt-1 truncate">
                {customer.name}
              </p>
              <p className="text-body-sm text-[var(--fg-secondary)] mt-0.5 truncate">
                {customer.email}
              </p>
              {customer.phone && (
                <p className="text-body-sm text-[var(--fg-secondary)] mt-0.5">
                  {customer.phone}
                </p>
              )}
            </div>
          )}

          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-card space-y-3">
            <h3 className="text-h3 text-[var(--fg-primary)]">সারাংশ</h3>
            <dl className="space-y-1.5 text-body-sm">
              <Row label="সাবটোটাল" value={`${toBengaliNumber(order.subtotal.toLocaleString("en-US"))}৳`} />
              {order.couponCode && (
                <Row label={`কুপন (${order.couponCode})`} value="-" muted />
              )}
              <Row label="ভ্যাট" value={`${toBengaliNumber(order.vat.toLocaleString("en-US"))}৳`} />
              <Row label="ডেলিভারি" value={`${toBengaliNumber(order.shipping.toLocaleString("en-US"))}৳`} />
            </dl>
            <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className="text-body-lg font-bold text-[var(--fg-primary)]">মোট</span>
              <span className="text-h3 font-bold text-[var(--fg-primary)] tabular-nums">
                {toBengaliNumber(order.total.toLocaleString("en-US"))}৳
              </span>
            </div>
            <p className="text-caption text-[var(--fg-muted)] pt-2 border-t border-[var(--border-muted)]">
              পেমেন্ট: {order.payment.method} · {order.payment.status}
            </p>
            {order.cancelReason && (
              <p className="text-caption text-discount-700 dark:text-discount-400">
                ক্যান্সেল কারণ: {order.cancelReason}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--fg-secondary)]">{label}</dt>
      <dd className={muted ? "text-[var(--fg-muted)]" : "font-semibold text-[var(--fg-primary)] tabular-nums"}>
        {value}
      </dd>
    </div>
  );
}
