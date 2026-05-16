import { MapPin, Pencil, Trash2, Star } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  zip?: string;
  isDefault?: boolean;
}

export interface AddressCardProps {
  address: Address;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  className?: string;
}

export function AddressCard({
  address,
  selectable = false,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  className,
}: AddressCardProps) {
  const interactive = selectable && onSelect;
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onSelect : undefined}
      onKeyDown={interactive ? (e) => (e.key === "Enter" || e.key === " ") && onSelect?.() : undefined}
      className={clsx(
        "rounded-lg border bg-[var(--bg-surface)] p-4 sm:p-5 transition-all",
        selected ? "border-brand-600 ring-2 ring-brand-600/15" : "border-[var(--border-default)]",
        interactive && "cursor-pointer hover:border-[var(--border-strong)]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex w-9 h-9 items-center justify-center rounded-md bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300 flex-shrink-0">
          <MapPin size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body font-semibold text-[var(--fg-primary)]">
              {address.label}
            </span>
            {address.isDefault && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-brand-100 text-brand-800 dark:bg-brand-700/30 dark:text-brand-300 text-caption font-bold">
                Default
              </span>
            )}
          </div>
          <p className="mt-1 text-body-sm text-[var(--fg-secondary)]">
            {address.recipientName} · {address.phone}
          </p>
          <p className="mt-1 text-body-sm text-[var(--fg-secondary)] leading-relaxed">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}, {address.city}
            {address.zip ? ` - ${address.zip}` : ""}
          </p>
          {onSetDefault && !address.isDefault && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSetDefault(); }}
              className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-brand-700 dark:text-brand-400 hover:underline"
            >
              <Star size={12} /> ডিফল্ট সেট করুন
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              aria-label="Edit address"
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--fg-primary)]"
            >
              <Pencil size={14} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              aria-label="Delete address"
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-discount-50 hover:text-discount-600 dark:hover:bg-discount-900/30"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
