import { Check, Clock, Package, Truck, Home as HomeIcon, X } from "lucide-react";
import { clsx } from "@/lib/clsx";
import type { OrderStatus } from "./OrderCard";

export interface OrderStatusTimelineProps {
  status: OrderStatus;
  className?: string;
}

const STAGES: Array<{ id: Exclude<OrderStatus, "cancelled">; label: string; icon: React.ReactNode }> = [
  { id: "placed", label: "Order Placed", icon: <Clock size={16} /> },
  { id: "confirmed", label: "Confirmed", icon: <Check size={16} /> },
  { id: "shipped", label: "Shipped", icon: <Truck size={16} /> },
  { id: "delivered", label: "Delivered", icon: <HomeIcon size={16} /> },
];

export function OrderStatusTimeline({ status, className }: OrderStatusTimelineProps) {
  if (status === "cancelled") {
    return (
      <div className={clsx("flex items-center gap-3 p-4 rounded-md bg-discount-50 dark:bg-discount-900/20 border border-discount-200 dark:border-discount-700/30", className)}>
        <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-discount-600 text-white">
          <X size={18} />
        </span>
        <div>
          <p className="text-body font-semibold text-discount-700 dark:text-discount-300">Order Cancelled</p>
          <p className="text-caption text-[var(--fg-muted)]">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  const currentIdx = STAGES.findIndex((s) => s.id === status);

  return (
    <ol className={clsx("relative", className)}>
      {STAGES.map((stage, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <li key={stage.id} className="flex items-start gap-3 pb-6 last:pb-0 relative">
            <span className={clsx(
              "z-10 inline-flex w-9 h-9 items-center justify-center rounded-full flex-shrink-0",
              done && !active && "bg-brand-600 text-white",
              active && "bg-brand-700 text-white ring-4 ring-brand-100 dark:ring-brand-700/30",
              !done && "bg-[var(--bg-surface-muted)] text-[var(--fg-muted)] border border-[var(--border-default)]",
            )}>
              {done ? <Check size={16} /> : stage.icon}
            </span>
            <div className="pt-1">
              <p className={clsx(
                "text-body font-semibold",
                done ? "text-[var(--fg-primary)]" : "text-[var(--fg-muted)]",
              )}>
                {stage.label}
              </p>
              {active && (
                <p className="text-caption text-brand-700 dark:text-brand-400 mt-0.5">Current status</p>
              )}
            </div>
            {i < STAGES.length - 1 && (
              <span className={clsx(
                "absolute left-[17px] top-9 w-0.5 h-full",
                i < currentIdx ? "bg-brand-600" : "bg-[var(--border-default)]",
              )} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
