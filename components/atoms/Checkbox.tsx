import { Check } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

/**
 * Custom-styled checkbox.
 *
 * Structural note: the styled box must be a SIBLING of the `peer` input, not
 * its parent, because Tailwind's `peer-checked:` compiles to `.peer:checked ~`
 * which is a sibling selector. The previous version had the input nested
 * inside the styled span, so `peer-checked:bg-brand-600` silently never
 * applied — checkboxes looked unstyled regardless of state.
 */
export function Checkbox({
  label,
  checked,
  className,
  id,
  disabled,
  ...rest
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={clsx(
        "inline-flex items-center gap-2.5 select-none",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <span className="relative inline-flex w-5 h-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className="peer absolute inset-0 w-full h-full opacity-0 cursor-inherit z-10"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={clsx(
            "absolute inset-0 inline-flex items-center justify-center rounded-[4px]",
            "border-2 border-[var(--border-strong)] bg-[var(--bg-surface)]",
            "transition-[background-color,border-color] duration-150",
            "peer-checked:bg-brand-600 peer-checked:border-brand-600",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
            "peer-focus-visible:ring-brand-500",
            "peer-hover:border-brand-500",
            "peer-disabled:bg-[var(--bg-surface-muted)] peer-disabled:border-[var(--border-default)]",
          )}
        >
          <Check
            size={14}
            strokeWidth={3}
            className={clsx(
              "text-white pointer-events-none transition-opacity duration-150",
              checked ? "opacity-100" : "opacity-0",
            )}
          />
        </span>
      </span>
      {label && (
        <span className="text-body-sm font-medium text-[var(--fg-primary)]">
          {label}
        </span>
      )}
    </label>
  );
}
