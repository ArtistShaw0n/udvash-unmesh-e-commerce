import { clsx } from "@/lib/clsx";

export interface ThumbnailButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /**
   * 1-based index used to compose an accessible name when no explicit
   * `aria-label` is provided. Required for icon-only buttons to satisfy
   * WCAG 4.1.2.
   */
  index?: number;
}

export function ThumbnailButton({
  active = false,
  index,
  className,
  type = "button",
  "aria-label": ariaLabel,
  ...rest
}: ThumbnailButtonProps) {
  const computedLabel =
    ariaLabel ?? (index !== undefined ? `View image ${index}` : "View image");
  return (
    <button
      type={type}
      aria-pressed={active}
      aria-label={computedLabel}
      className={clsx(
        "relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-[var(--bg-surface-muted)] transition-all flex-shrink-0",
        active
          ? "ring-2 ring-brand-600 ring-offset-2 ring-offset-[var(--bg-page)]"
          : "ring-1 ring-[var(--border-default)] hover:ring-[var(--border-strong)]",
        className,
      )}
      {...rest}
    >
      <span className="absolute inset-0 flex items-center justify-center text-[var(--fg-muted)]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 opacity-30" aria-hidden="true">
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
        </svg>
      </span>
    </button>
  );
}
