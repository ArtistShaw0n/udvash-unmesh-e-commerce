import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { toBengaliNumber } from "@/lib/site";
import { clsx } from "@/lib/clsx";

export interface OrderSummaryCardProps {
  itemCount: number;
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  onAddMore?: () => void;
  onCheckout?: () => void;
  className?: string;
}

function fmt(value: number): string {
  return toBengaliNumber(value.toLocaleString("en-US")) + "৳";
}

export function OrderSummaryCard({
  itemCount,
  subtotal,
  vat,
  shipping,
  total,
  onAddMore,
  onCheckout,
  className,
}: OrderSummaryCardProps) {
  return (
    <aside
      className={clsx(
        "rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card sticky top-24 space-y-5",
        className,
      )}
    >
      <h3 className="text-h3 text-[var(--fg-primary)]">অর্ডার সারাংশ</h3>

      <dl className="space-y-3">
        <div className="flex items-center justify-between">
          <dt className="text-body-sm text-[var(--fg-secondary)]">
            সাবটোটাল ({toBengaliNumber(itemCount)}টি)
          </dt>
          <dd className="text-body font-semibold text-[var(--fg-primary)]">{fmt(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-body-sm text-[var(--fg-secondary)]">ভ্যাট</dt>
          <dd className="text-body font-semibold text-[var(--fg-primary)]">{fmt(vat)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-body-sm text-[var(--fg-secondary)]">ডেলিভারি</dt>
          <dd className="text-body font-semibold text-[var(--fg-primary)]">{fmt(shipping)}</dd>
        </div>
      </dl>

      <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
        <span className="text-body-lg font-bold text-[var(--fg-primary)]">মোট</span>
        <span className="text-h3 font-bold text-[var(--fg-primary)]">{fmt(total)}</span>
      </div>

      <div className="space-y-3 pt-2">
        <Button variant="secondary" fullWidth onClick={onAddMore} rightIcon={<Plus size={16} />}>
          আরও যোগ করুন
        </Button>
        <Button variant="primary" fullWidth onClick={onCheckout} rightIcon={<ArrowRight size={16} />}>
          চেকআউট
        </Button>
      </div>
    </aside>
  );
}
