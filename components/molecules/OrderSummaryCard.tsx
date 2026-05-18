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

/**
 * OrderSummaryCard — right-rail summary used on /cart.
 *
 * Figma node 9:5261 (the cart screen):
 *   Card           bg white, rounded-md, padding 24, shadow-card
 *   Title          "Order Summary" — Poppins SemiBold ~20px, #3D3D3D
 *   Rows           "Subtotal (N items)", "Vat", "Shipping"
 *                  Label Inter 14/20 #676767; Value Poppins SemiBold 16
 *                  #3D3D3D, right-aligned, tabular numbers
 *   Total row      separator above; "Total" 18 SemiBold, value 24 Bold
 *   Add More CTA   outlined: bg-white, border + text #006D77, plus icon
 *   Checkout CTA   filled: bg #006D77, white text, arrow-right icon
 *
 * The chrome is intentionally in English in the Figma source (matching
 * the "Shopping Cart (N items)" title); the price values stay Bengali
 * digits because that's how rest of the site renders prices.
 */
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
      <h3 className="text-h3 text-[var(--fg-primary)]">Order Summary</h3>

      <dl className="space-y-3">
        <div className="flex items-center justify-between">
          <dt className="text-body-sm text-[var(--fg-secondary)]">
            Subtotal ({toBengaliNumber(itemCount)} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd className="text-body font-semibold text-[var(--fg-primary)] tabular-nums">
            {fmt(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-body-sm text-[var(--fg-secondary)]">Vat</dt>
          <dd className="text-body font-semibold text-[var(--fg-primary)] tabular-nums">
            {fmt(vat)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-body-sm text-[var(--fg-secondary)]">Shipping</dt>
          <dd className="text-body font-semibold text-[var(--fg-primary)] tabular-nums">
            {fmt(shipping)}
          </dd>
        </div>
      </dl>

      <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-between">
        <span className="text-body-lg font-bold text-[var(--fg-primary)]">Total</span>
        <span className="text-h3 font-bold text-[var(--fg-primary)] tabular-nums">
          {fmt(total)}
        </span>
      </div>

      <div className="space-y-3 pt-2">
        <Button variant="secondary" fullWidth onClick={onAddMore} rightIcon={<Plus size={16} />}>
          Add More
        </Button>
        <Button variant="primary" fullWidth onClick={onCheckout} rightIcon={<ArrowRight size={16} />}>
          Checkout
        </Button>
      </div>
    </aside>
  );
}
