"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/atoms";
import { EmptyState, OrderCard, type OrderSummary } from "@/components/molecules";
import { useAuth } from "@/lib/auth-context";
import { useOrders, formatBnDate } from "@/lib/orders-store";

export function OrdersList() {
  const { user } = useAuth();
  const { ordersFor } = useOrders();

  if (!user) return null;
  const myOrders = ordersFor(user.email);
  const summaries: OrderSummary[] = myOrders.map((o) => ({
    id: o.id,
    placedAt: formatBnDate(o.placedAt),
    itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
    total: o.total,
    status: o.status,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--fg-primary)]">আমার অর্ডার</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">
          আপনার সকল অর্ডার এক জায়গায়।
        </p>
      </div>

      {summaries.length > 0 ? (
        <div className="space-y-3">
          {summaries.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      ) : (
        <EmptyState
          icon={<Package size={36} />}
          title="এখনো কোন অর্ডার নেই"
          description="কেনাকাটা শুরু করে আপনার প্রথম অর্ডার দিন।"
          cta={<Button href="/products" variant="primary">কেনাকাটা শুরু করুন</Button>}
        />
      )}
    </div>
  );
}
