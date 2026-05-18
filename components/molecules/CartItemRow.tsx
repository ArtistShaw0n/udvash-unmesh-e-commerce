"use client";

import { X } from "lucide-react";
import { Checkbox } from "@/components/atoms/Checkbox";
import { QuantityCounter } from "./QuantityCounter";
import { clsx } from "@/lib/clsx";
import { toBengaliNumber } from "@/lib/site";

export interface CartItem {
  id: string;
  titleBn: string;
  category: string;
  price: number;
  unitPrice?: number;
  image?: string;
}

export interface CartItemRowProps {
  item: CartItem;
  quantity: number;
  selected: boolean;
  onToggleSelect: () => void;
  onQuantityChange: (q: number) => void;
  onRemove: () => void;
  className?: string;
}

/**
 * CartItemRow — responsive two-axis layout.
 *
 * Mobile (<sm): two-row stack to keep all controls visible inside a 320px container.
 *   ┌──────────────────────────────────────┐
 *   │ ☐ [img] Title                   ✕    │
 *   │         Category                     │
 *   │         ─────────────────────────    │
 *   │         [− 1 +]            ৳XXX      │
 *   └──────────────────────────────────────┘
 *
 * Desktop (sm+): the original single horizontal row.
 */
export function CartItemRow({
  item,
  quantity,
  selected,
  onToggleSelect,
  onQuantityChange,
  onRemove,
  className,
}: CartItemRowProps) {
  return (
    <div
      className={clsx(
        "py-4 border-b border-[var(--border-muted)] last:border-0",
        className,
      )}
    >
      {/* ---------------- Mobile (<sm) ---------------- */}
      <div className="sm:hidden flex gap-3">
        <Checkbox
          checked={selected}
          onChange={onToggleSelect}
          id={`select-${item.id}-m`}
          className="self-start pt-1"
        />
        <div className="w-16 h-20 rounded-md bg-[var(--bg-surface-muted)] border border-[var(--border-default)] flex-shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-body-sm font-semibold text-[var(--fg-primary)] leading-snug line-clamp-2">
                {item.titleBn}
              </h4>
              <p className="text-caption text-[var(--fg-muted)] mt-0.5">{item.category}</p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove item"
              // 36×36 visual + invisible extension to ~44 click target.
              className="relative flex-shrink-0 w-9 h-9 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:text-discount-600 hover:bg-discount-50 dark:hover:bg-discount-900/30 transition-colors before:absolute before:content-[''] before:-inset-1"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex items-end justify-between gap-2 mt-1">
            <QuantityCounter
              value={quantity}
              onChange={onQuantityChange}
              size="card"
              className="flex-shrink-0"
            />
            <div className="text-right">
              <p className="text-body font-bold text-[var(--fg-primary)] tabular-nums">
                {toBengaliNumber(item.price.toLocaleString("en-US"))}৳
              </p>
              {item.unitPrice && (
                <p className="text-caption text-[var(--fg-muted)] tabular-nums">
                  {toBengaliNumber(item.unitPrice.toLocaleString("en-US"))}৳/unit
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Tablet + Desktop (sm+) ---------------- */}
      <div className="hidden sm:flex items-center gap-4">
        <Checkbox checked={selected} onChange={onToggleSelect} id={`select-${item.id}`} />
        <div className="w-20 h-24 rounded-md bg-[var(--bg-surface-muted)] border border-[var(--border-default)] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-body font-semibold text-[var(--fg-primary)] truncate">
            {item.titleBn}
          </h4>
          <p className="text-caption text-[var(--fg-muted)] mt-0.5">{item.category}</p>
        </div>
        <QuantityCounter
          value={quantity}
          onChange={onQuantityChange}
          size="card"
          className="flex-shrink-0"
        />
        <div className="text-right flex-shrink-0 min-w-[5rem]">
          <p className="text-body font-bold text-[var(--fg-primary)]">
            {toBengaliNumber(item.price.toLocaleString("en-US"))}৳
          </p>
          {item.unitPrice && (
            <p className="text-caption text-[var(--fg-muted)]">
              {toBengaliNumber(item.unitPrice.toLocaleString("en-US"))}৳/unit
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove item"
          className="flex-shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:text-discount-600 hover:bg-discount-50 dark:hover:bg-discount-900/30 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
