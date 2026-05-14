import { clsx } from "@/lib/clsx";

export interface InfoChipProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function InfoChip({ icon, label, className }: InfoChipProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)]",
        className,
      )}
    >
      <span className="text-brand-600 dark:text-brand-400 flex-shrink-0">{icon}</span>
      <span className="text-body-sm font-medium text-[var(--fg-primary)]">{label}</span>
    </div>
  );
}
