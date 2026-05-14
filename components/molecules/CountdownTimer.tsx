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

  const segClasses =
    tone === "onBrand"
      ? "bg-white/15 text-white"
      : "bg-[var(--bg-surface-muted)] text-[var(--fg-primary)]";
  const labelClasses =
    tone === "onBrand" ? "text-white/70" : "text-[var(--fg-muted)]";

  return (
    <div
      className={clsx("flex items-stretch gap-2 sm:gap-3", className)}
      aria-label="Countdown"
    >
      {segments.map((seg, i) => (
        <div
          key={i}
          className={clsx(
            "flex flex-col items-center justify-center rounded-md min-w-[56px] sm:min-w-[64px] px-3 py-2",
            segClasses,
          )}
        >
          <span className="text-h3 font-bold leading-none tabular-nums">
            {seg.value !== undefined ? String(seg.value).padStart(2, "0") : "--"}
          </span>
          <span
            className={clsx(
              "text-caption font-semibold uppercase tracking-wider mt-1",
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
