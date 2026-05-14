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
    <div className={clsx(
      "flex items-center gap-3 sm:gap-4 py-4 border-b border-[var(--border-muted)] last:border-0",
      className,
    )}>
      <Checkbox checked={selected} onChange={onToggleSelect} id={`select-${item.id}`} />

      <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-md bg-[var(--bg-surface-muted)] border border-[var(--border-default)] flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <h4 className="text-body font-semibold text-[var(--fg-primary)] truncate">
          {item.titleBn}
        </h4>
        <p className="text-caption text-[var(--fg-muted)] mt-0.5">{item.category}</p>
      </div>

      <QuantityCounter value={quantity} onChange={onQuantityChange} className="flex-shrink-0" />

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
  );
}
