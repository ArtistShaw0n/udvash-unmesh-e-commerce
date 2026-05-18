"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "@/lib/clsx";

export interface CountdownTimerProps {
  targetDate: Date | string;
  /** "onBrand" for teal banner bg, "default" for light bg. */
  tone?: "onBrand" | "default";
  /** Format — hms shows Hours/Mins/Secs ticking, dhm shows Days/Hrs/Min slower. */
  format?: "hms" | "dhm";
  className?: string;
}

interface TimeLeft { d: number; h: number; m: number; s: number; }

function compute(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff / 3_600_000) % 24),
    m: Math.floor((diff / 60_000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

/**
 * Segmented countdown timer for the Flash Sale banner.
 *
 * Cell spec from Figma node 9:5585 (Flash Sale right-side container):
 *   Cell        89.328 × 94, gap 16, border-radius 16
 *   onBrand     bg rgba(255,255,255,0.10), border 1px rgba(255,255,255,0.20)
 *   default     bg var(--bg-surface-muted), text inherits foreground
 *   Number      Poppins Bold 36 / 40 line-height, tracking 0.3691, center
 *   Label       Poppins Regular 12 / 16, white 80% (or muted on light bg)
 *   Inner pad   pt 17, pb 1, px 21, gap 4 between number + label
 *
 * Inline variants (no boxed cells) are intentionally not handled here —
 * see CountdownInline for the chip-format alternative used on product
 * pages.
 */
export function CountdownTimer({
  targetDate,
  tone = "onBrand",
  format = "hms",
  className,
}: CountdownTimerProps) {
  const target = useMemo(
    () => (typeof targetDate === "string" ? new Date(targetDate) : targetDate),
    [targetDate],
  );
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => setLeft(compute(target));
    tick();
    const interval = format === "hms" ? 1000 : 30_000;
    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [target, format]);

  const segments =
    format === "hms"
      ? [
          { value: left?.h, label: "Hours" },
          { value: left?.m, label: "Mins" },
          { value: left?.s, label: "Secs" },
        ]
      : [
          { value: left?.d, label: "Days" },
          { value: left?.h, label: "Hrs" },
          { value: left?.m, label: "Min" },
        ];

  const cellClasses =
    tone === "onBrand"
      ? "bg-white/10 border border-white/20 text-white"
      : "bg-[var(--bg-surface-muted)] border border-[var(--border-default)] text-[var(--fg-primary)]";
  const labelClasses =
    tone === "onBrand" ? "text-white/80" : "text-[var(--fg-muted)]";

  return (
    <div
      className={clsx("flex items-stretch gap-3 sm:gap-4", className)}
      aria-label="Countdown"
    >
      {segments.map((seg, i) => (
        <div
          key={i}
          className={clsx(
            // Figma: 89.328 × 94, radius 16, pt-17 px-21 pb-1, gap-4 inner
            "flex flex-col items-center w-[72px] h-[80px] sm:w-[89px] sm:h-[94px] rounded-2xl pt-3 sm:pt-[17px] px-3 sm:px-[21px] pb-px gap-1",
            cellClasses,
          )}
        >
          <span className="font-poppins font-bold text-[28px] sm:text-[36px] leading-[40px] tabular-nums tracking-[0.0103em] text-center w-full">
            {seg.value !== undefined ? String(seg.value).padStart(2, "0") : "--"}
          </span>
          <span
            className={clsx(
              "font-poppins font-normal text-[12px] leading-4 text-center w-full",
              labelClasses,
            )}
          >
            {seg.label}
          </span>
        </div>
      ))}
    </div>
  );
}
