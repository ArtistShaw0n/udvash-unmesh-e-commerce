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
  /**
   * Size variant.
   * - "card" (default): 90×34px — matches the ProductCard action row in Figma spec
   * - "detail": larger 108×40px for product detail / cart page
   */
  size?: "card" | "detail";
  className?: string;
}

/**
 * Quantity stepper modelled on the Figma "header-navigation-container/Frame 19966" spec:
 * outer box w-[90] h-[34] with 1px #E5F0F1 border + 5px radius, an inner value box
 * w-[34] h-[24] with the same border + 4px radius. Minus/plus icons are flat
 * lucide glyphs at 16px stroke.
 */
export function QuantityCounter({
  value,
  defaultValue = 0,
  min = 0,
  max = 99,
  onChange,
  disabled,
  size = "card",
  className,
}: QuantityCounterProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  function setNext(next: number) {
    const clamped = Math.max(min, Math.min(max, next));
    if (value === undefined) setInternal(clamped);
    onChange?.(clamped);
  }

  const dims =
    size === "detail"
      ? {
          outer: "w-[108px] h-10 px-1.5 gap-2",
          stepBtn: "w-5 h-5",
          stepIcon: 18,
          valueBox: "w-10 h-7 text-[18px] leading-[24px]",
        }
      : {
          outer: "w-[90px] h-[34px] px-1 gap-1.5",
          stepBtn: "w-4 h-4",
          stepIcon: 16,
          valueBox: "w-[34px] h-6 text-[16px] leading-[24px]",
        };

  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center rounded-xs border border-[#E5F0F1] bg-white",
        dims.outer,
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setNext(current - 1)}
        disabled={current <= min}
        aria-label="Decrease quantity"
        className={clsx(
          "inline-flex items-center justify-center text-[#676767] hover:text-[var(--fg-primary)] disabled:opacity-40 transition-colors",
          dims.stepBtn,
        )}
      >
        <Minus size={dims.stepIcon} strokeWidth={2} />
      </button>
      <span
        className={clsx(
          "inline-flex items-center justify-center rounded-[4px] border border-[#E5F0F1] font-poppins font-normal text-[#676767] tabular-nums",
          dims.valueBox,
        )}
      >
        {current}
      </span>
      <button
        type="button"
        onClick={() => setNext(current + 1)}
        disabled={current >= max}
        aria-label="Increase quantity"
        className={clsx(
          "inline-flex items-center justify-center text-[#676767] hover:text-[var(--fg-primary)] disabled:opacity-40 transition-colors",
          dims.stepBtn,
        )}
      >
        <Plus size={dims.stepIcon} strokeWidth={2} />
      </button>
    </div>
  );
}
