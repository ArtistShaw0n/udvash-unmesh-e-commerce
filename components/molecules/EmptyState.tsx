import { clsx } from "@/lib/clsx";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cta?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, cta, className }: EmptyStateProps) {
  return (
    <div className={clsx("flex flex-col items-center text-center py-12 sm:py-16 px-6", className)}>
      {icon && (
        <div className="inline-flex w-16 h-16 sm:w-20 sm:h-20 items-center justify-center rounded-full bg-[var(--bg-surface-muted)] text-[var(--fg-muted)] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-h3 text-[var(--fg-primary)]">{title}</h3>
      {description && (
        <p className="text-body text-[var(--fg-secondary)] mt-2 max-w-md">{description}</p>
      )}
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}
