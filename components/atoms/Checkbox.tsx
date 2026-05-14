import { Check } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
}

export function Checkbox({
  label,
  checked,
  className,
  id,
  ...rest
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={clsx(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        className,
      )}
    >
      <span className="relative inline-flex w-5 h-5 items-center justify-center rounded-sm border border-[var(--border-strong)] bg-[var(--bg-surface)] transition-colors peer-checked:bg-brand-600 peer-checked:border-brand-600">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          className="peer absolute inset-0 opacity-0 cursor-pointer"
          {...rest}
        />
        {checked && (
          <Check
            size={14}
            className="absolute text-white pointer-events-none"
            strokeWidth={3}
          />
        )}
      </span>
      {label && <span className="text-body-sm">{label}</span>}
    </label>
  );
}
