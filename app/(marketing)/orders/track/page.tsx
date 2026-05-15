"use client";

import { useState } from "react";
import { Package, Mail } from "lucide-react";
import { Button } from "@/components/atoms";
import { FormField, OrderStatusTimeline } from "@/components/molecules";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [tracking, setTracking] = useState(false);

  return (
    <section className="section-pad-sm">
      <div className="container-site">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300 mb-3">
              <Package size={26} />
            </div>
            <h1 className="text-h2 text-[var(--fg-primary)]">অর্ডার ট্র্যাক করুন</h1>
            <p className="text-body text-[var(--fg-secondary)] mt-2">
              অর্ডার আইডি ও ইমেইল দিন — রিয়েল-টাইম স্ট্যাটাস দেখুন।
            </p>
          </div>

          {!tracking ? (
            <form
              className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-8 shadow-card space-y-4"
              onSubmit={(e) => { e.preventDefault(); setTracking(true); }}
            >
              <FormField
                id="oid"
                label="অর্ডার আইডি"
                placeholder="UU892145"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                leftIcon={<Package size={18} />}
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
                required
              />
              <Button type="submit" variant="primary" size="lg" fullWidth>ট্র্যাক করুন</Button>
            </form>
          ) : (
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-8 shadow-card space-y-5">
              <div>
                <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">Order</p>
                <p className="text-h3 font-bold text-[var(--fg-primary)]">#{orderId}</p>
              </div>
              <OrderStatusTimeline status="shipped" />
              <Button variant="secondary" onClick={() => setTracking(false)} fullWidth>আবার চেষ্টা করুন</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
