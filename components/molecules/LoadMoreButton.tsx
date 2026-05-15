import { ChevronDown } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface LoadMoreButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function LoadMoreButton({
  label = "আরো দেখুন",
  className,
  type = "button",
  ...rest
}: LoadMoreButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center gap-2 px-6 py-3 rounded-pill border border-[var(--border-default)] bg-[var(--bg-surface)] text-body font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-surface-muted)] hover:border-[var(--border-strong)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        className,
      )}
      {...rest}
    >
      {label}
      <ChevronDown size={16} aria-hidden="true" />
    </button>
  );
}
