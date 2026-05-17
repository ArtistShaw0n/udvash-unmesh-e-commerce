import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { OrderStatusTimeline } from "@/components/molecules";
import { toBengaliNumber } from "@/lib/site";
import { getAllBooks } from "@/lib/books";

export const metadata: Metadata = { title: "অর্ডার ডিটেইল" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sampleItems = getAllBooks().slice(0, 2);
  const subtotal = sampleItems.reduce((sum, b) => sum + b.price, 0);
  const vat = 50;
  const shipping = 50;
  const total = subtotal + vat + shipping;

  return (
    <section className="section-pad-sm">
      <div className="container-site space-y-6">
        <Link href="/account/orders" className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700">
          <ChevronLeft size={16} /> আমার অর্ডারে ফিরে যান
        </Link>

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-h1 text-[var(--fg-primary)]">Order #{id}</h1>
            <p className="text-body text-[var(--fg-secondary)] mt-1">Placed on ১৬ মে, ২০২৬</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start min-w-0 [&>*]:min-w-0">
          <div className="space-y-6">
            {/* Status timeline */}
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
              <h2 className="text-h3 text-[var(--fg-primary)] mb-4">অর্ডার স্ট্যাটাস</h2>
              <OrderStatusTimeline status="confirmed" />
            </div>

            {/* Items */}
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
              <h2 className="text-h3 text-[var(--fg-primary)] mb-4">অর্ডারকৃত বইসমূহ</h2>
              <ul className="divide-y divide-[var(--border-muted)]">
                {sampleItems.map((book) => (
                  <li key={book.slug} className="flex items-center gap-4 py-4">
                    <div className="w-16 h-20 rounded-md bg-[var(--bg-surface-muted)] border border-[var(--border-default)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-semibold text-[var(--fg-primary)] truncate">{book.title}</p>
                      <p className="text-caption text-[var(--fg-muted)]">{book.categoryLabel}</p>
                    </div>
                    <p className="text-body font-bold text-[var(--fg-primary)]">
                      {toBengaliNumber(book.price.toLocaleString("en-US"))}৳
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Address */}
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
              <h2 className="text-h3 text-[var(--fg-primary)] mb-2">ডেলিভারি ঠিকানা</h2>
              <p className="text-body text-[var(--fg-secondary)]">
                Shawon Ahmed · 01798214677<br />
                হাউজ ৭১, রোড ৪, ব্লক সি, বনশ্রী, ঢাকা ১২১৯
              </p>
            </div>
          </div>

          {/* Summary */}
          <aside className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card sticky top-24 space-y-4">
            <h3 className="text-h3 text-[var(--fg-primary)]">Order Summary</h3>
            <dl className="space-y-2">
              <Row label={`Subtotal (${sampleItems.length} items)`} value={subtotal} />
              <Row label="Vat" value={vat} />
              <Row label="Shipping" value={shipping} />
            </dl>
            <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className="text-body-lg font-bold text-[var(--fg-primary)]">Total</span>
              <span className="text-h3 font-bold text-[var(--fg-primary)]">
                {toBengaliNumber(total.toLocaleString("en-US"))}৳
              </span>
            </div>
            <div className="pt-2 text-caption text-[var(--fg-muted)]">
              পেমেন্ট: bKash · Paid
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
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
