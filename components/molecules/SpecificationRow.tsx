import { clsx } from "@/lib/clsx";

export interface SpecificationRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function SpecificationRow({ label, value, className }: SpecificationRowProps) {
  return (
    <div className={clsx("grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] items-start gap-3 py-3", className)}>
      <dt className="text-body-sm text-[var(--fg-muted)]">{label}</dt>
      <dd className="text-body-sm font-semibold text-[var(--fg-primary)]">{value}</dd>
    </div>
  );
}
