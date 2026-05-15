"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField, OrderStatusTimeline } from "@/components/molecules";
import {
  DEMO_TRACKING_HINT,
  findOrder,
  type ResolvedOrder,
} from "@/lib/orders";
import { toBengaliNumber } from "@/lib/site";

type Result =
  | { kind: "idle" }
  | { kind: "found"; order: ResolvedOrder }
  | { kind: "not-found"; tried: { id: string; email: string } };

function isValidOrderId(value: string): boolean {
  return /^UU\d{6}$/i.test(value.trim());
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });
  const [errors, setErrors] = useState<{ orderId?: string; email?: string }>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!orderId.trim()) next.orderId = "অর্ডার আইডি দিন";
    else if (!isValidOrderId(orderId)) next.orderId = "ফরম্যাট: UU তারপর ৬ ডিজিট (যেমন UU892145)";
    if (!email.trim()) next.email = "ইমেইল দিন";
    else if (!isValidEmail(email)) next.email = "সঠিক ইমেইল ফরম্যাট দিন";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const order = findOrder(orderId, email);
    setResult(
      order
        ? { kind: "found", order }
        : { kind: "not-found", tried: { id: orderId.trim().toUpperCase(), email: email.trim() } },
    );
  }

  function resetForm() {
    setResult({ kind: "idle" });
    setErrors({});
  }

  function useDemo() {
    setOrderId(DEMO_TRACKING_HINT.orderId);
    setEmail(DEMO_TRACKING_HINT.email);
    setErrors({});
  }

  return (
    <section className="section-pad-sm">
      <div className="container-site">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300 mb-3">
              <Package size={26} />
            </div>
            <h1 className="text-h1 text-[var(--fg-primary)]">অর্ডার ট্র্যাক করুন</h1>
            <p className="text-body text-[var(--fg-secondary)] mt-2 max-w-xl mx-auto">
              আপনার অর্ডার আইডি ও অর্ডারে ব্যবহৃত ইমেইল দিন — রিয়েল-টাইম স্ট্যাটাস, কুরিয়ার ট্র্যাকিং
              ও আনুমানিক ডেলিভারি তারিখ দেখুন।
            </p>
          </div>

          {result.kind === "found" ? (
            <OrderDetail order={result.order} onTrackAnother={resetForm} />
          ) : (
            <>
              <form
                className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-8 shadow-card space-y-4"
                onSubmit={handleSubmit}
                noValidate
              >
                <FormField
                  id="oid"
                  label="অর্ডার আইডি"
                  placeholder="UU892145"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  leftIcon={<Package size={18} />}
                  error={errors.orderId}
                  autoComplete="off"
                  required
                />
                <FormField
                  id="email"
                  type="email"
                  label="ইমেইল"
                  placeholder="অর্ডারে ব্যবহৃত ইমেইল"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={18} />}
                  error={errors.email}
                  autoComplete="email"
                  required
                />
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  ট্র্যাক করুন
                </Button>
                <div className="pt-2 border-t border-[var(--border-muted)]">
                  <p className="text-caption text-[var(--fg-muted)]">
                    ডেমো:{" "}
                    <button
                      type="button"
                      onClick={useDemo}
                      className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 underline underline-offset-2"
                    >
                      {DEMO_TRACKING_HINT.orderId} / {DEMO_TRACKING_HINT.email}
                    </button>{" "}
                    দিয়ে চেষ্টা করুন।
                  </p>
                </div>
              </form>

              {result.kind === "not-found" && (
                <div
                  role="alert"
                  className="rounded-lg border border-discount-200 dark:border-discount-700/40 bg-discount-50 dark:bg-discount-900/20 p-5 flex items-start gap-3"
                >
                  <AlertCircle
                    size={22}
                    className="text-discount-700 dark:text-discount-300 flex-shrink-0 mt-0.5"
                  />
                  <div className="space-y-1">
                    <p className="text-body font-semibold text-discount-800 dark:text-discount-200">
                      অর্ডার খুঁজে পাওয়া যায়নি
                    </p>
                    <p className="text-body-sm text-discount-700 dark:text-discount-300">
                      <span className="font-semibold">{result.tried.id}</span> আইডির সাথে{" "}
                      <span className="font-semibold">{result.tried.email}</span> ইমেইল মিলছে না।
                      দয়া করে আবার চেক করুন, অথবা সাহায্যের জন্য{" "}
                      <Link href="/contact" className="underline font-semibold">
                        যোগাযোগ
                      </Link>{" "}
                      করুন।
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function OrderDetail({
  order,
  onTrackAnother,
}: {
  order: ResolvedOrder;
  onTrackAnother: () => void;
}) {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <button
        type="button"
        onClick={onTrackAnother}
        className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700 transition-colors"
      >
        <ArrowLeft size={16} /> অন্য অর্ডার ট্র্যাক করুন
      </button>

      {/* Header card */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              Order
            </p>
            <p className="text-h2 font-bold text-[var(--fg-primary)] tabular-nums">
              #{order.id}
            </p>
            <p className="text-body-sm text-[var(--fg-secondary)] mt-1">
              {order.placedAt} এ অর্ডার করা হয়েছে · {toBengaliNumber(itemCount)}{" "}
              {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
            <div className="rounded-md bg-brand-50 dark:bg-brand-700/15 border border-brand-100 dark:border-brand-700/30 px-4 py-3">
              <p className="text-caption font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 flex items-center gap-1.5">
                <Clock size={14} /> আনুমানিক ডেলিভারি
              </p>
              <p className="text-body font-bold text-[var(--fg-primary)] mt-0.5">
                {order.estimatedDelivery}
              </p>
            </div>
          )}
          {order.status === "delivered" && (
            <div className="rounded-md bg-success-50 dark:bg-success-700/15 border border-success-200 dark:border-success-700/30 px-4 py-3 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-success-700 dark:text-success-400" />
              <p className="text-body font-bold text-success-800 dark:text-success-300">
                ডেলিভার্ড
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-6">
          {/* Status timeline */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
            <h2 className="text-h3 text-[var(--fg-primary)] mb-4">অর্ডার স্ট্যাটাস</h2>
            <OrderStatusTimeline status={order.status} />
          </div>

          {/* Courier tracking */}
          {order.courier && order.status !== "cancelled" && (
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
              <h2 className="text-h3 text-[var(--fg-primary)] mb-4 flex items-center gap-2">
                <Truck size={20} /> কুরিয়ার ট্র্যাকিং
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <KV label="কুরিয়ার" value={order.courier.name} />
                <KV label="ট্র্যাকিং নম্বর" value={order.courier.trackingNumber} mono />
                <KV label="সর্বশেষ আপডেট" value={order.courier.lastUpdate} />
                <KV label="বর্তমান অবস্থান" value={order.courier.lastLocation} />
              </div>
            </div>
          )}

          {/* Items */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
            <h2 className="text-h3 text-[var(--fg-primary)] mb-4">অর্ডারকৃত বইসমূহ</h2>
            <ul className="divide-y divide-[var(--border-muted)]">
              {order.items.map((it) => (
                <li key={it.slug} className="flex items-center gap-4 py-4">
                  <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-md bg-[var(--bg-surface-muted)] border border-[var(--border-default)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${it.slug}`}
                      className="text-body font-semibold text-[var(--fg-primary)] hover:text-brand-700 transition-colors line-clamp-2"
                    >
                      {it.titleBn}
                    </Link>
                    <p className="text-caption text-[var(--fg-muted)] mt-0.5">
                      {it.categoryLabel} · ×{toBengaliNumber(it.quantity)}
                    </p>
                  </div>
                  <p className="text-body font-bold text-[var(--fg-primary)] tabular-nums flex-shrink-0">
                    {toBengaliNumber(it.subtotal.toLocaleString("en-US"))}৳
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Shipping address */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
            <h2 className="text-h3 text-[var(--fg-primary)] mb-3 flex items-center gap-2">
              <MapPin size={20} /> ডেলিভারি ঠিকানা
            </h2>
            <p className="text-body text-[var(--fg-primary)] font-semibold">
              {order.address.recipientName}
            </p>
            <p className="text-body-sm text-[var(--fg-secondary)] flex items-center gap-1.5 mt-1">
              <Phone size={14} /> {order.address.phone}
            </p>
            <p className="text-body-sm text-[var(--fg-secondary)] mt-2 leading-relaxed">
              {order.address.line1}
              <br />
              {order.address.city}
              {order.address.zip ? ` — ${order.address.zip}` : ""}
            </p>
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card sticky top-24 space-y-4">
          <h3 className="text-h3 text-[var(--fg-primary)]">Order Summary</h3>
          <dl className="space-y-2">
            <Row label={`Subtotal (${toBengaliNumber(itemCount)} ${itemCount === 1 ? "item" : "items"})`} value={order.subtotal} />
            <Row label="Vat" value={order.vat} />
            <Row label="Shipping" value={order.shipping} />
          </dl>
          <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
            <span className="text-body-lg font-bold text-[var(--fg-primary)]">Total</span>
            <span className="text-h3 font-bold text-[var(--fg-primary)] tabular-nums">
              {toBengaliNumber(order.total.toLocaleString("en-US"))}৳
            </span>
          </div>
          <div className="pt-3 border-t border-[var(--border-default)] space-y-1">
            <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              পেমেন্ট
            </p>
            <p className="text-body-sm text-[var(--fg-primary)] flex items-center gap-2">
              <span className="font-semibold">{order.payment.method}</span>
              <span
                className={
                  order.payment.status === "paid"
                    ? "inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-bold bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-300"
                    : order.payment.status === "cod"
                    ? "inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-bold bg-warning-100 text-warning-800 dark:bg-warning-700/30 dark:text-warning-300"
                    : "inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-bold bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
                }
              >
                {order.payment.status === "paid" && "Paid"}
                {order.payment.status === "cod" && "Cash on Delivery"}
                {order.payment.status === "pending" && "Pending"}
              </span>
            </p>
          </div>
          <Button href="/contact" variant="secondary" fullWidth>
            সাহায্য দরকার?
          </Button>
        </aside>
      </div>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
        {label}
      </p>
      <p
        className={
          mono
            ? "text-body font-semibold text-[var(--fg-primary)] tabular-nums mt-0.5"
            : "text-body font-semibold text-[var(--fg-primary)] mt-0.5"
        }
      >
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-body-sm text-[var(--fg-secondary)]">{label}</dt>
      <dd className="text-body font-semibold text-[var(--fg-primary)] tabular-nums">
        {toBengaliNumber(value.toLocaleString("en-US"))}৳
      </dd>
    </div>
  );
}
