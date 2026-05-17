"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Plus, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/atoms";
import {
  AddressCard,
  CheckoutStepper,
  FormField,
  PaymentMethodPicker,
  type PaymentMethodId,
} from "@/components/molecules";
import { useAuth, type AddressInput } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { getBookBySlug } from "@/lib/books";
import {
  useOrders,
  type PaymentMethod,
  type PaymentStatus,
  type StoredOrderItem,
} from "@/lib/orders-store";
import { useToast } from "@/lib/toast-context";
import { toBengaliNumber } from "@/lib/site";

const STEPS = [{ label: "ঠিকানা" }, { label: "পেমেন্ট" }, { label: "রিভিউ" }];

const VAT_RATE = 0.05;
const SHIPPING_FLAT = 50;

const PAYMENT_LABELS: Record<PaymentMethodId, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  card: "Credit / Debit Card",
  cod: "Cash on Delivery",
};

export function CheckoutFlow() {
  const router = useRouter();
  const { user, hydrated: authHydrated, addAddress } = useAuth();
  const { items, hydrated: cartHydrated, clearSelected } = useCart();
  const orders = useOrders();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [addressId, setAddressId] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [newAddr, setNewAddr] = useState<AddressInput>({
    label: "বাসা",
    recipientName: "",
    phone: "",
    line1: "",
    city: "",
    zip: "",
  });
  const [payment, setPayment] = useState<PaymentMethodId>("bkash");
  const [promo, setPromo] = useState("");
  const [placing, setPlacing] = useState(false);

  // Resolve selected cart items against the catalog.
  const selectedItems = useMemo(() => {
    return items
      .filter((i) => i.selected)
      .map((entry) => {
        const book = getBookBySlug(entry.slug);
        return book ? { entry, book } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [items]);

  const itemCount = selectedItems.reduce((s, r) => s + r.entry.quantity, 0);
  const subtotal = selectedItems.reduce(
    (sum, r) => sum + r.book.price * r.entry.quantity,
    0,
  );
  const vat = subtotal > 0 ? Math.round(subtotal * VAT_RATE) : 0;
  const shipping = subtotal > 0 ? SHIPPING_FLAT : 0;
  const total = subtotal + vat + shipping;

  // Auto-select the default (or first) address once user data is hydrated.
  useEffect(() => {
    if (!authHydrated || !user) return;
    if (addressId) return;
    const def = user.addresses.find((a) => a.isDefault) ?? user.addresses[0];
    if (def) setAddressId(def.id);
  }, [authHydrated, user, addressId]);

  // Gate 1: not logged in → /login?next=/checkout
  useEffect(() => {
    if (!authHydrated) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent("/checkout")}`);
    }
  }, [authHydrated, user, router]);

  // Gate 2: email not verified → /verify-email?next=/checkout
  useEffect(() => {
    if (!authHydrated || !user) return;
    if (!user.emailVerified) {
      router.replace(`/verify-email?next=${encodeURIComponent("/checkout")}`);
    }
  }, [authHydrated, user, router]);

  // Gate 3: nothing selected → back to /cart
  useEffect(() => {
    if (!cartHydrated) return;
    if (selectedItems.length === 0) {
      router.replace("/cart");
    }
  }, [cartHydrated, selectedItems.length, router]);

  // Stable shell pre-hydration.
  if (
    !authHydrated ||
    !cartHydrated ||
    !user ||
    !user.emailVerified ||
    selectedItems.length === 0
  ) {
    return (
      <section className="section-pad-sm">
        <div className="container-site">
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card min-h-[40vh]" />
        </div>
      </section>
    );
  }

  const addresses = user.addresses;
  const selectedAddress = addresses.find((a) => a.id === addressId);

  function handleSaveNewAddress() {
    if (!newAddr.recipientName || !newAddr.phone || !newAddr.line1 || !newAddr.city) {
      toast.error("সব ঘর পূরণ করুন");
      return;
    }
    const created = addAddress(newAddr, addresses.length === 0);
    setAddressId(created.id);
    setAdding(false);
    setNewAddr({ label: "বাসা", recipientName: "", phone: "", line1: "", city: "", zip: "" });
    toast.success("ঠিকানা যোগ হয়েছে");
  }

  function nextStep() {
    if (step === 0 && !selectedAddress) {
      toast.error("ঠিকানা সিলেক্ট করুন");
      return;
    }
    setStep((s) => Math.min(2, s + 1));
  }

  async function handlePlaceOrder() {
    if (!selectedAddress || !user) return;
    setPlacing(true);
    try {
      const orderItems: StoredOrderItem[] = selectedItems.map(({ entry, book }) => ({
        slug: book.slug,
        quantity: entry.quantity,
        price: book.price,
        titleBn: book.titleBn,
      }));

      const paymentStatus: PaymentStatus =
        payment === "cod" ? "cod" : payment === "card" ? "paid" : "pending";

      const orderId = orders.placeOrder({
        email: user.email,
        items: orderItems,
        address: {
          recipientName: selectedAddress.recipientName,
          phone: selectedAddress.phone,
          line1: selectedAddress.line1,
          line2: selectedAddress.line2,
          city: selectedAddress.city,
          zip: selectedAddress.zip,
        },
        payment: { method: payment as PaymentMethod, status: paymentStatus },
        subtotal,
        vat,
        shipping,
        total,
      });

      clearSelected();
      toast.success("অর্ডার সফল!", `Order #${orderId}`);
      router.push(`/order/${orderId}/success`);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <section className="section-pad-sm">
      <div className="container-site space-y-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700"
        >
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
                    {addresses.length === 0 ? (
                      <div className="rounded-md bg-warning-50 dark:bg-warning-700/15 border border-warning-200 dark:border-warning-700/30 px-4 py-3">
                        <p className="text-body-sm text-warning-800 dark:text-warning-300">
                          কোন ঠিকানা নেই। অর্ডার করতে নতুন ঠিকানা যোগ করুন।
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((a) => (
                          <AddressCard
                            key={a.id}
                            address={a}
                            selectable
                            selected={addressId === a.id}
                            onSelect={() => setAddressId(a.id)}
                          />
                        ))}
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => setAdding(true)}
                      leftIcon={<Plus size={16} />}
                    >
                      নতুন ঠিকানা যোগ করুন
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-h4 text-[var(--fg-primary)]">নতুন ঠিকানা</h3>
                    <FormField
                      id="addr-label"
                      label="লেবেল (বাসা / অফিস)"
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    />
                    <FormField
                      id="addr-name"
                      label="প্রাপকের নাম"
                      placeholder="আপনার নাম"
                      value={newAddr.recipientName}
                      onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                    />
                    <FormField
                      id="addr-phone"
                      label="ফোন"
                      placeholder="০১XXXXXXXXX"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    />
                    <FormField
                      id="addr-line"
                      label="ঠিকানা"
                      placeholder="বাড়ি, রোড, এলাকা"
                      value={newAddr.line1}
                      onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                    />
                    <FormField
                      id="addr-city"
                      label="শহর"
                      placeholder="ঢাকা"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    />
                    <FormField
                      id="addr-zip"
                      label="পোস্ট কোড"
                      placeholder="১২১৯"
                      value={newAddr.zip ?? ""}
                      onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                    />
                    <div className="flex gap-3">
                      <Button variant="primary" onClick={handleSaveNewAddress}>সেভ করুন</Button>
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
                <div className="space-y-4">
                  <SectionMini title="ডেলিভারি ঠিকানা">
                    {selectedAddress ? (
                      <>
                        {selectedAddress.recipientName} · {selectedAddress.phone}
                        <br />
                        {selectedAddress.line1}, {selectedAddress.city}
                        {selectedAddress.zip ? ` — ${selectedAddress.zip}` : ""}
                      </>
                    ) : (
                      "—"
                    )}
                  </SectionMini>
                  <SectionMini title="পেমেন্ট">{PAYMENT_LABELS[payment]}</SectionMini>
                  <div>
                    <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-2">
                      আপনার অর্ডার
                    </p>
                    <ul className="divide-y divide-[var(--border-muted)] rounded-md border border-[var(--border-default)]">
                      {selectedItems.map(({ entry, book }) => (
                        <li key={book.slug} className="flex items-center gap-3 px-3 py-2.5">
                          <span className="flex-1 text-body-sm text-[var(--fg-primary)] truncate">
                            {book.titleBn}
                          </span>
                          <span className="text-caption text-[var(--fg-muted)] tabular-nums">
                            ×{toBengaliNumber(entry.quantity)}
                          </span>
                          <span className="text-body-sm font-semibold text-[var(--fg-primary)] tabular-nums min-w-[5rem] text-right">
                            {toBengaliNumber((book.price * entry.quantity).toLocaleString("en-US"))}৳
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-2">
                      প্রোমো কোড
                    </p>
                    <div className="flex gap-2">
                      <Input
                        leftIcon={<Tag size={16} />}
                        placeholder="কোড দিন"
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                      />
                      <Button variant="secondary" onClick={() => toast.info("কোডটি বৈধ নয়")}>
                        Apply
                      </Button>
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
                <Button variant="primary" onClick={nextStep}>
                  পরবর্তী
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size={{ base: "md", md: "lg" }}
                  onClick={handlePlaceOrder}
                  disabled={placing}
                >
                  {placing ? "প্রসেস হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
                </Button>
              )}
            </div>
          </div>

          {/* Summary */}
          <aside className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card sticky top-24 space-y-4">
            <h3 className="text-h3 text-[var(--fg-primary)]">Order Summary</h3>
            <dl className="space-y-2">
              <SummaryRow
                label={`Subtotal (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
                value={subtotal}
              />
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
      <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-1">
        {title}
      </p>
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
