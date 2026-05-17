"use client";

import { Check, CreditCard, Banknote, Smartphone } from "lucide-react";
import { clsx } from "@/lib/clsx";

export type PaymentMethodId = "bkash" | "nagad" | "card" | "cod";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  description?: string;
}

const DEFAULT_METHODS: PaymentMethod[] = [
  { id: "bkash", label: "bKash", description: "মোবাইল ব্যাংকিং (bKash)" },
  { id: "nagad", label: "Nagad", description: "মোবাইল ব্যাংকিং (Nagad)" },
  { id: "card", label: "Card", description: "Credit / Debit Card" },
  { id: "cod", label: "Cash on Delivery", description: "ডেলিভারির সময় পেমেন্ট" },
];

const ICON: Record<PaymentMethodId, React.ReactNode> = {
  bkash: <Smartphone size={20} />,
  nagad: <Smartphone size={20} />,
  card: <CreditCard size={20} />,
  cod: <Banknote size={20} />,
};

export interface PaymentMethodPickerProps {
  value: PaymentMethodId;
  onChange: (id: PaymentMethodId) => void;
  methods?: PaymentMethod[];
  className?: string;
}

export function PaymentMethodPicker({
  value,
  onChange,
  methods = DEFAULT_METHODS,
  className,
}: PaymentMethodPickerProps) {
  return (
    <div role="radiogroup" className={clsx("grid sm:grid-cols-2 gap-3", className)}>
      {methods.map((m) => {
        const selected = m.id === value;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(m.id)}
            className={clsx(
              "flex items-center gap-3 rounded-md border p-4 text-left transition-all",
              selected
                ? "border-brand-600 ring-2 ring-brand-600/15 bg-brand-50 dark:bg-brand-700/15"
                : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]",
            )}
          >
            <span className={clsx(
              "inline-flex w-10 h-10 items-center justify-center rounded-md flex-shrink-0",
              selected ? "bg-brand-600 text-white" : "bg-[var(--bg-surface-muted)] text-[var(--fg-secondary)]",
            )}>
              {ICON[m.id]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-body font-semibold text-[var(--fg-primary)]">{m.label}</p>
              {m.description && (
                <p className="text-caption text-[var(--fg-muted)] mt-0.5">{m.description}</p>
              )}
            </div>
            {selected && (
              <Check size={18} className="text-brand-700 dark:text-brand-400 flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
