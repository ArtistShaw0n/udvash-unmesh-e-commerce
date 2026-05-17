"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "@/lib/clsx";

export interface CountdownInlineProps {
  targetDate: Date | string;
  /** Emphasis variant — chip wraps in a pill background. Default just renders inline text. */
  variant?: "text" | "chip";
  /** Show "Days" segment when > 0. Default true. */
  showDays?: boolean;
  className?: string;
}

interface TimeLeft {
  d: number;
  h: number;
  m: number;
  s: number;
}

function compute(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff / 3_600_000) % 24),
    m: Math.floor((diff / 60_000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number | undefined): string {
  return n === undefined ? "--" : String(n).padStart(2, "0");
}

/**
 * Inline countdown timer rendered as `HH:MM:SS` (or `DD:HH:MM:SS` if days > 0
 * and showDays is on). Each pair sits in a small chip with a colon separator
 * — the format readers actually parse correctly. Use this inside flowing text
 * where the full segmented `<CountdownTimer>` would be too tall.
 */
export function CountdownInline({
  targetDate,
  variant = "text",
  showDays = true,
  className,
}: CountdownInlineProps) {
  const target = useMemo(
    () => (typeof targetDate === "string" ? new Date(targetDate) : targetDate),
    [targetDate],
  );

  // Defer first render so server-side never produces a value that mismatches
  // the client after a tick — avoids hydration warnings.
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => setLeft(compute(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const includeDays = showDays && (left?.d ?? 0) > 0;

  // Wrapper styles per variant
  const wrapperClass =
    variant === "chip"
      ? "inline-flex items-center gap-1 rounded-md bg-brand-50 dark:bg-brand-700/20 px-2 py-1 text-brand-700 dark:text-brand-300 font-bold tabular-nums text-body-sm"
      : "inline-flex items-center gap-0.5 font-bold tabular-nums";

  const cellClass =
    variant === "chip"
      ? "inline-block min-w-[1.4em] text-center"
      : "inline-block min-w-[1.4em] text-center rounded bg-[var(--bg-surface-muted)] px-1 py-0.5";

  const colonClass =
    variant === "chip"
      ? "opacity-70"
      : "opacity-60 px-0.5";

  return (
    <span
      className={clsx(wrapperClass, className)}
      aria-label="Countdown timer"
      role="timer"
    >
      {includeDays && (
        <>
          <span className={cellClass}>{pad(left?.d)}</span>
          <span className={colonClass}>:</span>
        </>
      )}
      <span className={cellClass}>{pad(left?.h)}</span>
      <span className={colonClass}>:</span>
      <span className={cellClass}>{pad(left?.m)}</span>
      <span className={colonClass}>:</span>
      <span className={cellClass}>{pad(left?.s)}</span>
    </span>
  );
}
