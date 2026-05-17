"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Printer, ChevronLeft } from "lucide-react";
import { Button, LogoWhite } from "@/components/atoms";
import { EmptyState } from "@/components/molecules";
import { useAuth } from "@/lib/auth-context";
import { useOrders, formatBnDate } from "@/lib/orders-store";
import {
  SITE_ADDRESS_BN,
  SITE_EMAIL,
  SITE_NAME_BN,
  SITE_PHONE_BN,
  toBengaliNumber,
} from "@/lib/site";

export interface OrderInvoiceProps {
  orderId: string;
}

/**
 * Printable invoice for an order. Strips the marketing chrome (header/
 * footer/banner) via the `<body className="invoice-print">` toggle set
 * in useEffect — the matching @media print rules + hide-on-print CSS
 * live in globals.css.
 */
export function OrderInvoice({ orderId }: OrderInvoiceProps) {
  const { user } = useAuth();
  const { getOrder } = useOrders();

  useEffect(() => {
    document.body.classList.add("invoice-print");
    return () => document.body.classList.remove("invoice-print");
  }, []);

  if (!user) return null;
  const order = getOrder(orderId);

  if (!order || order.email !== user.email.toLowerCase()) {
    return (
      <EmptyState
        title="অর্ডার পাওয়া যায়নি"
        description="এই অর্ডারটি আপনার একাউন্টে নেই।"
        cta={
          <Button href="/account/orders" variant="primary">
            আমার অর্ডারে ফিরে যান
          </Button>
        }
      />
    );
  }

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="bg-[var(--bg-page)] min-h-screen">
      {/* On-screen toolbar (hidden when printing) */}
      <div className="print:hidden bg-[var(--bg-surface)] border-b border-[var(--border-default)] py-3">
        <div className="container-site flex items-center justify-between gap-3">
          <Link
            href={`/account/orders/${orderId}`}
            className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700"
          >
            <ChevronLeft size={16} /> অর্ডারে ফিরে যান
          </Link>
          <Button
            variant="primary"
            size={{ base: "sm", md: "md" }}
            leftIcon={<Printer size={16} />}
            onClick={() => window.print()}
          >
            প্রিন্ট করুন
          </Button>
        </div>
      </div>

      {/* Invoice paper */}
      <div className="container-site py-8">
        <div className="max-w-3xl mx-auto bg-white text-[#1a1a1a] shadow-card rounded-md p-8 sm:p-10 print:p-0 print:shadow-none print:rounded-none print:max-w-none">
          {/* Letterhead */}
          <header className="flex items-start justify-between gap-4 pb-6 border-b-2 border-[#1a1a1a]">
            <div>
              <div className="inline-block bg-[var(--color-brand-700,#006D77)] rounded-md px-3 py-2">
                <LogoWhite size="md" href="" />
              </div>
              <p className="text-caption text-[#666] mt-3 leading-relaxed">
                {SITE_NAME_BN}
                <br />
                {SITE_ADDRESS_BN}
                <br />
                {SITE_PHONE_BN} · {SITE_EMAIL}
              </p>
            </div>
            <div className="text-right">
              <h1 className="text-h2 font-bold tracking-tight">INVOICE</h1>
              <p className="text-body-sm mt-2 text-[#666]">
                #{order.id}
                <br />
                {formatBnDate(order.placedAt)}
              </p>
            </div>
          </header>

          {/* Bill-to + meta */}
          <section className="grid sm:grid-cols-2 gap-6 mt-6 text-body-sm">
            <div>
              <p className="text-caption font-bold uppercase tracking-wider text-[#888]">
                Bill to
              </p>
              <p className="font-semibold mt-1">{order.address.recipientName}</p>
              <p className="text-[#444] leading-relaxed">
                {order.address.phone}
                <br />
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ""}
                <br />
                {order.address.city}
                {order.address.zip ? ` — ${order.address.zip}` : ""}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-caption font-bold uppercase tracking-wider text-[#888]">
                Payment
              </p>
              <p className="font-semibold mt-1 capitalize">{order.payment.method}</p>
              <p className="text-[#444]">
                {order.payment.status === "paid" && "Paid"}
                {order.payment.status === "pending" && "Pending"}
                {order.payment.status === "cod" && "Cash on Delivery"}
              </p>
            </div>
          </section>

          {/* Line items */}
          <section className="mt-8">
            <table className="w-full text-body-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1a1a1a] text-left">
                  <th className="pb-2 font-bold">Item</th>
                  <th className="pb-2 font-bold text-center w-16">Qty</th>
                  <th className="pb-2 font-bold text-right w-20">Price</th>
                  <th className="pb-2 font-bold text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.slug} className="border-b border-[#e5e5e5]">
                    <td className="py-3">{it.titleBn}</td>
                    <td className="py-3 text-center tabular-nums">
                      {toBengaliNumber(it.quantity)}
                    </td>
                    <td className="py-3 text-right tabular-nums">
                      {toBengaliNumber(it.price.toLocaleString("en-US"))}৳
                    </td>
                    <td className="py-3 text-right tabular-nums font-semibold">
                      {toBengaliNumber((it.price * it.quantity).toLocaleString("en-US"))}৳
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="text-body-sm">
                <tr>
                  <td colSpan={3} className="pt-4 pr-4 text-right text-[#666]">
                    Subtotal ({toBengaliNumber(itemCount)} items)
                  </td>
                  <td className="pt-4 text-right tabular-nums">
                    {toBengaliNumber(order.subtotal.toLocaleString("en-US"))}৳
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-1 pr-4 text-right text-[#666]">
                    VAT
                  </td>
                  <td className="pt-1 text-right tabular-nums">
                    {toBengaliNumber(order.vat.toLocaleString("en-US"))}৳
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-1 pr-4 text-right text-[#666]">
                    Shipping
                  </td>
                  <td className="pt-1 text-right tabular-nums">
                    {toBengaliNumber(order.shipping.toLocaleString("en-US"))}৳
                  </td>
                </tr>
                <tr className="border-t-2 border-[#1a1a1a]">
                  <td colSpan={3} className="pt-3 pr-4 text-right font-bold">
                    Total
                  </td>
                  <td className="pt-3 text-right tabular-nums font-bold text-h3">
                    {toBengaliNumber(order.total.toLocaleString("en-US"))}৳
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          <footer className="mt-10 pt-6 border-t border-[#e5e5e5] text-caption text-[#888] text-center leading-relaxed">
            ধন্যবাদ আপনার অর্ডারের জন্য।
            <br />
            যেকোন প্রশ্নে: {SITE_PHONE_BN} · {SITE_EMAIL}
          </footer>
        </div>
      </div>
    </div>
  );
}
