import { Package } from "lucide-react";
import { Button } from "@/components/atoms";
import { EmptyState, OrderCard } from "@/components/molecules";
import type { OrderSummary } from "@/components/molecules";

export const metadata = { title: "আমার অর্ডার" };

const ORDERS: OrderSummary[] = [
  { id: "UU892145", placedAt: "১৬ মে, ২০২৬", itemCount: 2, total: 2350, status: "confirmed" },
  { id: "UU881903", placedAt: "১০ মে, ২০২৬", itemCount: 1, total: 450, status: "delivered" },
  { id: "UU874562", placedAt: "৫ মে, ২০২৬", itemCount: 3, total: 1290, status: "shipped" },
  { id: "UU862117", placedAt: "২৮ এপ্রিল, ২০২৬", itemCount: 1, total: 383, status: "delivered" },
  { id: "UU855004", placedAt: "১৫ এপ্রিল, ২০২৬", itemCount: 2, total: 940, status: "cancelled" },
];

export default function MyOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--fg-primary)]">আমার অর্ডার</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">আপনার সকল অর্ডার এক জায়গায়।</p>
      </div>

      {ORDERS.length > 0 ? (
        <div className="space-y-3">
          {ORDERS.map((o) => <OrderCard key={o.id} order={o} />)}
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
