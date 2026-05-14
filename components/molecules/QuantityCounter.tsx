"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface QuantityCounterProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function QuantityCounter({
  value,
  defaultValue = 0,
  min = 0,
  max = 99,
  onChange,
  disabled,
  className,
}: QuantityCounterProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  function setNext(next: number) {
    const clamped = Math.max(min, Math.min(max, next));
    if (value === undefined) setInternal(clamped);
    onChange?.(clamped);
  }

  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)]",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setNext(current - 1)}
        disabled={current <= min}
        aria-label="Decrease quantity"
        className="w-9 h-9 inline-flex items-center justify-center text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-muted)] rounded-l-md disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-[2.5rem] text-center text-body-sm font-semibold text-[var(--fg-primary)] tabular-nums">
        {current}
      </span>
      <button
        type="button"
        onClick={() => setNext(current + 1)}
        disabled={current >= max}
        aria-label="Increase quantity"
        className="w-9 h-9 inline-flex items-center justify-center text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-muted)] rounded-r-md disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
