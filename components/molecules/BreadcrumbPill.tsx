import { clsx } from "@/lib/clsx";

export interface BreadcrumbPillProps {
  /** Short category label, rendered as a pill */
  category: string;
  /** Longer continuation, rendered as plain text after the separator dot */
  title: string;
  className?: string;
}

/**
 * Used at the top of the ProductDetail info panel:
 *   [ Academic ]  ·  HSC Parallel Text
 */
export function BreadcrumbPill({ category, title, className }: BreadcrumbPillProps) {
  return (
    <div className={clsx("flex items-center gap-3 flex-wrap", className)}>
      <span className="inline-flex items-center px-3 py-1 rounded-pill bg-[var(--bg-surface)] border border-[var(--border-default)] text-body-sm font-semibold text-brand-700 dark:text-brand-300">
        {category}
      </span>
      <span className="text-[var(--fg-muted)]" aria-hidden="true">·</span>
      <span className="text-body-sm font-semibold text-[var(--fg-secondary)]">
        {title}
      </span>
    </div>
  );
}
