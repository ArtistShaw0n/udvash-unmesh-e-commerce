"use client";

import { Star } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface StarRatingProps {
  value: number;          // current rating (0-5, can be fractional like 4.3)
  max?: number;
  size?: number;
  /** When set, becomes interactive (sets rating on click). */
  onChange?: (value: number) => void;
  className?: string;
  label?: string;
}

/**
 * Stars row. Read-only by default. Pass onChange to make it interactive
 * (used in the "write a review" form).
 */
export function StarRating({
  value,
  max = 5,
  size = 16,
  onChange,
  className,
  label,
}: StarRatingProps) {
  const interactive = !!onChange;
  return (
    <div
      role={interactive ? "radiogroup" : "img"}
      aria-label={label ?? `Rating ${value} out of ${max}`}
      className={clsx("inline-flex items-center gap-0.5", className)}
    >
      {Array.from({ length: max }, (_, i) => {
        const idx = i + 1;
        // Fill is determined by how much of this star is covered by value
        const fill = Math.max(0, Math.min(1, value - i));
        const Wrap = interactive ? "button" : "span";
        return (
          <Wrap
            key={idx}
            {...(interactive
              ? {
                  type: "button",
                  role: "radio",
                  "aria-checked": idx === Math.round(value),
                  "aria-label": `${idx} star${idx > 1 ? "s" : ""}`,
                  onClick: () => onChange?.(idx),
                  className:
                    "inline-flex items-center justify-center hover:scale-110 transition-transform",
                }
              : { "aria-hidden": true, className: "inline-flex" })}
          >
            <span className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                size={size}
                className="absolute inset-0 text-warning-200 dark:text-warning-700/30"
                fill="currentColor"
                strokeWidth={1.25}
              />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                  aria-hidden="true"
                >
                  <Star
                    size={size}
                    className="text-warning-500"
                    fill="currentColor"
                    strokeWidth={1.25}
                  />
                </span>
              )}
            </span>
          </Wrap>
        );
      })}
    </div>
  );
}
