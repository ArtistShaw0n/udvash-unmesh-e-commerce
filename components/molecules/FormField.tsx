import { Input, type InputProps } from "@/components/atoms/Input";
import { clsx } from "@/lib/clsx";

export interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  help?: string;
}

export function FormField({
  label,
  error,
  help,
  className,
  id,
  ...inputProps
}: FormFieldProps) {
  return (
    <div className={clsx("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-body-sm font-semibold text-[var(--fg-primary)]">
        {label}
      </label>
      <Input id={id} {...inputProps} />
      {error && <p className="text-caption text-discount-600">{error}</p>}
      {!error && help && <p className="text-caption text-[var(--fg-muted)]">{help}</p>}
    </div>
  );
}
