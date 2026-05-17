"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Package, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/atoms";
import {
  EmptyState,
  FormField,
  OrderStatusTimeline,
} from "@/components/molecules";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useOrders, formatBnDate } from "@/lib/orders-store";
import { useToast } from "@/lib/toast-context";
import { toBengaliNumber } from "@/lib/site";

export interface OrderDetailViewProps {
  orderId: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  card: "Card",
  cod: "Cash on Delivery",
};

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { getOrder, cancelOrder, requestReturn } = useOrders();
  const cart = useCart();
  const toast = useToast();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  if (!user) return null;
  const order = getOrder(orderId);

  // Order not found OR not owned by current user
  if (!order || order.email !== user.email.toLowerCase()) {
    return (
      <EmptyState
        icon={<Package size={36} />}
        title="অর্ডার পাওয়া যায়নি"
        description="এই অর্ডারটি আপনার একাউন্টে নেই।"
        cta={<Button href="/account/orders" variant="primary">আমার অর্ডারে ফিরে যান</Button>}
      />
    );
  }

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const canCancel = order.status === "placed" || order.status === "confirmed";
  const canReturn = order.status === "delivered" && order.returnStatus === "none";
  const canReorder = order.items.length > 0;

  function handleCancel() {
    cancelOrder(orderId, cancelReason.trim() || undefined);
    setCancelOpen(false);
    setCancelReason("");
    toast.success("অর্ডার বাতিল হয়েছে");
  }

  function handleReturn() {
    if (!returnReason.trim()) {
      toast.error("রিটার্নের কারণ লিখুন");
      return;
    }
    requestReturn(orderId, returnReason.trim());
    setReturnOpen(false);
    setReturnReason("");
    toast.success("রিটার্ন রিকোয়েস্ট পাঠানো হয়েছে", "আমরা শিগগিরই যোগাযোগ করব।");
  }

  function handleReorder() {
    if (!order) return;
    order.items.forEach((it) => cart.addItem(it.slug, it.quantity));
    toast.success("কার্টে যোগ হয়েছে", `${toBengaliNumber(itemCount)} টি বই`);
    router.push("/cart");
  }

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700"
      >
        <ChevronLeft size={16} /> আমার অর্ডারে ফিরে যান
      </Link>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-h1 text-[var(--fg-primary)]">Order #{order.id}</h1>
          <p className="text-body text-[var(--fg-secondary)] mt-1">
            Placed on {formatBnDate(order.placedAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canReorder && (
            <Button variant="secondary" leftIcon={<RotateCcw size={16} />} onClick={handleReorder}>
              আবার অর্ডার করুন
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" leftIcon={<X size={16} />} onClick={() => setCancelOpen(true)}>
              অর্ডার বাতিল
            </Button>
          )}
          {canReturn && (
            <Button variant="secondary" onClick={() => setReturnOpen(true)}>
              রিটার্ন রিকোয়েস্ট
            </Button>
          )}
        </div>
      </div>

      {/* Return status banner */}
      {order.returnStatus !== "none" && (
        <div className="rounded-lg bg-warning-50 dark:bg-warning-700/15 border border-warning-200 dark:border-warning-700/30 p-4">
          <p className="text-caption font-bold uppercase tracking-wider text-warning-800 dark:text-warning-300">
            রিটার্ন স্ট্যাটাস
          </p>
          <p className="text-body font-semibold text-warning-800 dark:text-warning-200 mt-0.5">
            {returnStatusLabel(order.returnStatus)}
          </p>
          {order.returnReason && (
            <p className="text-body-sm text-warning-700 dark:text-warning-300 mt-1">
              কারণ: {order.returnReason}
            </p>
          )}
        </div>
      )}

      {/* Cancel reason banner */}
      {order.status === "cancelled" && order.cancelReason && (
        <div className="rounded-lg bg-discount-50 dark:bg-discount-900/20 border border-discount-200 dark:border-discount-700/40 p-4">
          <p className="text-caption font-bold uppercase tracking-wider text-discount-800 dark:text-discount-300">
            ক্যান্সেলের কারণ
          </p>
          <p className="text-body-sm text-discount-700 dark:text-discount-300 mt-1">
            {order.cancelReason}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start min-w-0 [&>*]:min-w-0">
        <div className="space-y-6">
          {/* Status timeline */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
            <h2 className="text-h3 text-[var(--fg-primary)] mb-4">অর্ডার স্ট্যাটাস</h2>
            <OrderStatusTimeline status={order.status} />
          </div>

          {/* Items */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
            <h2 className="text-h3 text-[var(--fg-primary)] mb-4">অর্ডারকৃত বইসমূহ</h2>
            <ul className="divide-y divide-[var(--border-muted)]">
              {order.items.map((it) => (
                <li key={it.slug} className="flex items-center gap-4 py-4">
                  <div className="w-16 h-20 rounded-md bg-[var(--bg-surface-muted)] border border-[var(--border-default)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${it.slug}`}
                      className="text-body font-semibold text-[var(--fg-primary)] hover:text-brand-700 transition-colors line-clamp-2"
                    >
                      {it.titleBn}
                    </Link>
                    <p className="text-caption text-[var(--fg-muted)] mt-0.5">
                      ×{toBengaliNumber(it.quantity)}
                    </p>
                  </div>
                  <p className="text-body font-bold text-[var(--fg-primary)]">
                    {toBengaliNumber((it.price * it.quantity).toLocaleString("en-US"))}৳
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Address */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
            <h2 className="text-h3 text-[var(--fg-primary)] mb-2">ডেলিভারি ঠিকানা</h2>
            <p className="text-body text-[var(--fg-secondary)] leading-relaxed">
              {order.address.recipientName} · {order.address.phone}
              <br />
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}
              {order.address.zip ? ` — ${order.address.zip}` : ""}
            </p>
          </div>
        </div>

        {/* Summary */}
        <aside className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card sticky top-24 space-y-4">
          <h3 className="text-h3 text-[var(--fg-primary)]">Order Summary</h3>
          <dl className="space-y-2">
            <Row label={`Subtotal (${toBengaliNumber(itemCount)} items)`} value={order.subtotal} />
            <Row label="Vat" value={order.vat} />
            <Row label="Shipping" value={order.shipping} />
          </dl>
          <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
            <span className="text-body-lg font-bold text-[var(--fg-primary)]">Total</span>
            <span className="text-h3 font-bold text-[var(--fg-primary)]">
              {toBengaliNumber(order.total.toLocaleString("en-US"))}৳
            </span>
          </div>
          <div className="pt-2 text-caption text-[var(--fg-muted)]">
            পেমেন্ট: {PAYMENT_LABELS[order.payment.method] ?? order.payment.method} · {paymentStatusLabel(order.payment.status)}
          </div>
        </aside>
      </div>

      {/* Cancel modal */}
      {cancelOpen && (
        <Modal title="অর্ডার বাতিল" onClose={() => setCancelOpen(false)}>
          <p className="text-body-sm text-[var(--fg-secondary)]">
            অর্ডার বাতিল করার কারণ লিখুন (ঐচ্ছিক):
          </p>
          <FormField
            id="cancel-reason"
            label="কারণ"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="যেমন: ভুল আইটেম, সময়মত প্রয়োজন নেই..."
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>বাতিল</Button>
            <Button variant="danger" onClick={handleCancel}>নিশ্চিত করুন</Button>
          </div>
        </Modal>
      )}

      {/* Return modal */}
      {returnOpen && (
        <Modal title="রিটার্ন রিকোয়েস্ট" onClose={() => setReturnOpen(false)}>
          <p className="text-body-sm text-[var(--fg-secondary)]">
            ডেলিভারির ৭ দিনের মধ্যে রিটার্ন করা যাবে। কারণ লিখুন:
          </p>
          <FormField
            id="return-reason"
            label="রিটার্নের কারণ"
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="যেমন: ভুল বই, পৃষ্ঠা ছেঁড়া..."
            required
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setReturnOpen(false)}>বাতিল</Button>
            <Button variant="primary" onClick={handleReturn}>সাবমিট</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function returnStatusLabel(s: string): string {
  switch (s) {
    case "requested": return "রিকোয়েস্ট পেন্ডিং";
    case "approved": return "অনুমোদিত — পিকআপ অপেক্ষায়";
    case "picked-up": return "পিকআপ সম্পন্ন";
    case "refunded": return "রিফান্ড সম্পন্ন";
    case "rejected": return "রিকোয়েস্ট প্রত্যাখ্যাত";
    default: return "—";
  }
}

function paymentStatusLabel(s: string): string {
  switch (s) {
    case "paid": return "Paid";
    case "cod": return "Cash on Delivery";
    case "pending": return "Pending";
    default: return s;
  }
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-body-sm text-[var(--fg-secondary)]">{label}</dt>
      <dd className="text-body font-semibold text-[var(--fg-primary)]">
        {toBengaliNumber(value.toLocaleString("en-US"))}৳
      </dd>
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
        className="w-full max-w-md rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-card-hover p-5 sm:p-6 space-y-4"
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
