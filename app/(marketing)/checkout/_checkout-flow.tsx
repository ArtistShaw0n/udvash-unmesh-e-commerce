"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Plus, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/atoms";
import {
  AddressCard,
  CheckoutStepper,
  FormField,
  PaymentMethodPicker,
  type Address,
  type PaymentMethodId,
} from "@/components/molecules";
import { toBengaliNumber } from "@/lib/site";

const SAMPLE_ADDRESSES: Address[] = [
  {
    id: "1",
    label: "বাসা",
    recipientName: "Shawon Ahmed",
    phone: "01798214677",
    line1: "হাউজ ৭১, রোড ৪, ব্লক সি",
    city: "বনশ্রী, ঢাকা",
    zip: "১২১৯",
    isDefault: true,
  },
  {
    id: "2",
    label: "অফিস",
    recipientName: "Shawon Ahmed",
    phone: "01798214677",
    line1: "ধানমন্ডি ২৭, রোড ১১",
    city: "ঢাকা",
    zip: "১২০৭",
  },
];

const STEPS = [
  { label: "ঠিকানা" },
  { label: "পেমেন্ট" },
  { label: "রিভিউ" },
];

export function CheckoutFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [addressId, setAddressId] = useState(SAMPLE_ADDRESSES[0].id);
  const [adding, setAdding] = useState(false);
  const [payment, setPayment] = useState<PaymentMethodId>("bkash");
  const [promo, setPromo] = useState("");

  const subtotal = 2250;
  const vat = 250;
  const shipping = 50;
  const total = subtotal + vat + shipping;

  const handlePlaceOrder = () => {
    const orderId = "UU" + Date.now().toString().slice(-6);
    router.push(`/order/${orderId}/success`);
  };

  return (
    <section className="section-pad-sm">
      <div className="container-site space-y-6">
        <Link href="/cart" className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700">
          <ChevronLeft size={16} /> Back to Cart
        </Link>

        <div className="flex justify-center pb-2">
          <CheckoutStepper steps={STEPS} current={step} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card space-y-5">
            {step === 0 && (
              <>
                <h2 className="text-h3 text-[var(--fg-primary)] flex items-center gap-2">
                  <MapPin size={20} /> ডেলিভারি ঠিকানা
                </h2>
                {!adding ? (
                  <>
                    <div className="space-y-3">
                      {SAMPLE_ADDRESSES.map((a) => (
                        <AddressCard
                          key={a.id}
                          address={a}
                          selectable
                          selected={addressId === a.id}
                          onSelect={() => setAddressId(a.id)}
                        />
                      ))}
                    </div>
                    <Button variant="secondary" onClick={() => setAdding(true)} leftIcon={<Plus size={16} />}>
                      নতুন ঠিকানা যোগ করুন
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-h4 text-[var(--fg-primary)]">নতুন ঠিকানা</h3>
                    <FormField id="name" label="প্রাপকের নাম" placeholder="আপনার নাম" />
                    <FormField id="phone" label="ফোন" placeholder="০১XXXXXXXXX" />
                    <FormField id="line1" label="ঠিকানা" placeholder="বাড়ি, রোড, এলাকা" />
                    <FormField id="city" label="শহর" placeholder="ঢাকা" />
                    <div className="flex gap-3">
                      <Button variant="primary" onClick={() => setAdding(false)}>সেভ করুন</Button>
                      <Button variant="secondary" onClick={() => setAdding(false)}>বাতিল</Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="text-h3 text-[var(--fg-primary)]">পেমেন্ট পদ্ধতি</h2>
                <PaymentMethodPicker value={payment} onChange={setPayment} />
                {payment === "bkash" && (
                  <div className="rounded-md bg-[var(--bg-surface-muted)] p-4 text-body-sm text-[var(--fg-secondary)]">
                    Order confirm করার পর bKash payment instruction পাবেন।
                  </div>
                )}
                {payment === "card" && (
                  <div className="space-y-3 pt-2">
                    <FormField id="card-number" label="কার্ড নম্বর" placeholder="XXXX XXXX XXXX XXXX" />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField id="card-exp" label="Expiry" placeholder="MM/YY" />
                      <FormField id="card-cvv" label="CVV" placeholder="•••" />
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-h3 text-[var(--fg-primary)]">অর্ডার রিভিউ</h2>
                <div className="space-y-3">
                  <SectionMini title="ডেলিভারি ঠিকানা">
                    {SAMPLE_ADDRESSES.find((a) => a.id === addressId)?.line1}
                  </SectionMini>
                  <SectionMini title="পেমেন্ট">
                    {payment === "bkash" && "bKash"}
                    {payment === "nagad" && "Nagad"}
                    {payment === "card" && "Credit / Debit Card"}
                    {payment === "cod" && "Cash on Delivery"}
                  </SectionMini>
                  <div>
                    <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-2">প্রোমো কোড</p>
                    <div className="flex gap-2">
                      <Input
                        leftIcon={<Tag size={16} />}
                        placeholder="কোড দিন"
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                      />
                      <Button variant="secondary">Apply</Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-muted)]">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                পেছনে
              </Button>
              {step < 2 ? (
                <Button variant="primary" onClick={() => setStep((s) => s + 1)}>
                  পরবর্তী
                </Button>
              ) : (
                <Button variant="primary" size="lg" onClick={handlePlaceOrder}>
                  অর্ডার নিশ্চিত করুন
                </Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <aside className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card sticky top-24 space-y-4">
            <h3 className="text-h3 text-[var(--fg-primary)]">Order Summary</h3>
            <dl className="space-y-2">
              <SummaryRow label="Subtotal (2 items)" value={subtotal} />
              <SummaryRow label="Vat" value={vat} />
              <SummaryRow label="Shipping" value={shipping} />
            </dl>
            <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className="text-body-lg font-bold text-[var(--fg-primary)]">Total</span>
              <span className="text-h3 font-bold text-[var(--fg-primary)]">
                {toBengaliNumber(total.toLocaleString("en-US"))}৳
              </span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function SectionMini({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-1">{title}</p>
      <p className="text-body text-[var(--fg-primary)]">{children}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-body-sm text-[var(--fg-secondary)]">{label}</dt>
      <dd className="text-body font-semibold text-[var(--fg-primary)]">
        {toBengaliNumber(value.toLocaleString("en-US"))}৳
      </dd>
    </div>
  );
}
