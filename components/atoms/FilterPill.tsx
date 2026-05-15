import { clsx } from "@/lib/clsx";

export interface FilterPillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function FilterPill({
  active = false,
  className,
  children,
  type = "button",
  ...rest
}: FilterPillProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={clsx(
        "inline-flex items-center justify-center px-4 py-2 rounded-pill border text-body-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        active
          ? "bg-brand-600 text-white border-brand-600 hover:bg-brand-700 hover:border-brand-700"
          : "bg-[var(--bg-surface)] text-[var(--fg-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--fg-primary)]",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
