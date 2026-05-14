import { clsx } from "@/lib/clsx";

export interface ThumbnailButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function ThumbnailButton({
  active = false,
  className,
  type = "button",
  ...rest
}: ThumbnailButtonProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
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
