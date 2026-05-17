"use client";

import { useEffect, useRef } from "react";
import { Check, Minus } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  /**
   * Tri-state: when true, renders the indeterminate (mixed) glyph regardless
   * of `checked`. Use on a parent "Select All" when some-but-not-all children
   * are checked. Sets `aria-checked="mixed"` for screen readers.
   */
  indeterminate?: boolean;
  /**
   * Visual size. `md` (default) = 20×20 — used in dense surfaces like the
   * cart Select-All and per-row checkboxes. `sm` = 16×16 — used in dense
   * filter sidebars (the standard "settings checkbox" size).
   */
  size?: "sm" | "md";
}

/**
 * Canonical checkbox covering the full standard state machine:
 *
 *   - unchecked          (default)
 *   - hover              (border tints toward brand)
 *   - focus-visible      (brand ring + offset for keyboard users)
 *   - active / pressed   (no separate visual; relies on browser default)
 *   - checked            (brand fill + white check glyph)
 *   - indeterminate      (brand fill + white minus glyph; aria-checked="mixed")
 *   - disabled           (opacity 60, muted bg)
 *   - checked+disabled   (filled but desaturated)
 *
 * Structural note: the styled box is a SIBLING of the `peer` input, never its
 * parent. `peer-checked:` compiles to a `~` sibling selector, so nesting the
 * peer inside the styled element silently breaks the style. The `indeterminate`
 * property of `HTMLInputElement` is set imperatively via a ref because React
 * does not surface it as a prop.
 */
export function Checkbox({
  label,
  checked,
  indeterminate = false,
  size = "md",
  className,
  id,
  disabled,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Sync the DOM `indeterminate` flag — React does not bind it via JSX.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const showAsFilled = indeterminate || !!checked;
  const isSm = size === "sm";

  return (
    <label
      htmlFor={id}
      className={clsx(
        "inline-flex items-center select-none",
        isSm ? "gap-2" : "gap-2.5",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <span
        className={clsx(
          "relative inline-flex shrink-0",
          isSm ? "w-4 h-4" : "w-5 h-5",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-checked={indeterminate ? "mixed" : checked ? "true" : "false"}
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-inherit z-10"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={clsx(
            "absolute inset-0 inline-flex items-center justify-center rounded-[4px]",
            "border-2 transition-[background-color,border-color] duration-150",
            // Idle vs filled (covers both checked and indeterminate)
            showAsFilled
              ? "bg-brand-600 border-brand-600"
              : "bg-[var(--bg-surface)] border-[var(--border-strong)]",
            // Hover only when not filled — once filled, keep brand
            !showAsFilled && !disabled
              ? "peer-hover:border-brand-500"
              : undefined,
            // Focus ring (keyboard) — visible in any state
            "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
            "peer-focus-visible:ring-brand-500",
            // Disabled — desaturated
            disabled && !showAsFilled
              ? "bg-[var(--bg-surface-muted)] border-[var(--border-default)]"
              : undefined,
            disabled && showAsFilled
              ? "bg-brand-300 border-brand-300 dark:bg-brand-700 dark:border-brand-700"
              : undefined,
          )}
        >
          {/* Indeterminate takes priority over checked when both true.
              Glyph sizes scale with the box: 11px for sm (16 box),
              14px for md (20 box) — keeps the same inner-padding ratio. */}
          {indeterminate ? (
            <Minus
              size={isSm ? 11 : 14}
              strokeWidth={3.5}
              className="text-white pointer-events-none"
            />
          ) : (
            <Check
              size={isSm ? 11 : 14}
              strokeWidth={3}
              className={clsx(
                "text-white pointer-events-none transition-opacity duration-150",
                checked ? "opacity-100" : "opacity-0",
              )}
            />
          )}
        </span>
      </span>
      {label && (
        <span
          className={clsx(
            "text-body-sm font-medium",
            disabled ? "text-[var(--fg-muted)]" : "text-[var(--fg-primary)]",
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}
