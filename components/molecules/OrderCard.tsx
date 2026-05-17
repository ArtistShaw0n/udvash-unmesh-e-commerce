import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { clsx } from "@/lib/clsx";
import { toBengaliNumber } from "@/lib/site";

export type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<OrderStatus, string> = {
  placed: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
  confirmed: "bg-brand-100 text-brand-800 dark:bg-brand-700/30 dark:text-brand-300",
  shipped: "bg-warning-100 text-warning-800 dark:bg-warning-700/30 dark:text-warning-300",
  delivered: "bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-300",
  cancelled: "bg-discount-100 text-discount-700 dark:bg-discount-700/30 dark:text-discount-300",
};

export interface OrderSummary {
  id: string;
  placedAt: string;        // ISO or display string
  itemCount: number;
  total: number;
  status: OrderStatus;
}

export interface OrderCardProps {
  order: OrderSummary;
  href?: string;
  className?: string;
}

export function OrderCard({ order, href, className }: OrderCardProps) {
  const linkHref = href ?? `/account/orders/${order.id}`;
  return (
    <Link
      href={linkHref}
      className={clsx(
        "group flex items-center gap-4 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 sm:p-5 shadow-card hover:shadow-card-hover transition-shadow",
        className,
      )}
    >
      <span className="inline-flex w-11 h-11 items-center justify-center rounded-md bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300 flex-shrink-0">
        <Package size={20} />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-body font-semibold text-[var(--fg-primary)]">
            Order #{order.id}
          </span>
          <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-bold", STATUS_TONE[order.status])}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <p className="text-caption text-[var(--fg-muted)] mt-1">
          {toBengaliNumber(order.itemCount)} {order.itemCount === 1 ? "item" : "items"} · {order.placedAt}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-body font-bold text-[var(--fg-primary)]">
          {toBengaliNumber(order.total.toLocaleString("en-US"))}৳
        </p>
        <ChevronRight size={18} className="ml-auto mt-1 text-[var(--fg-muted)] group-hover:text-brand-700 transition-colors" />
      </div>
    </Link>
  );
}
