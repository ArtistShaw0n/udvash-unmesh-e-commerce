import { clsx } from "@/lib/clsx";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "full";
}

/**
 * Pulsing grey block used as a loading placeholder while data fetches.
 * Pass width/height via Tailwind classes (h-4 w-24 etc.) or inline style.
 */
export function Skeleton({
  className,
  rounded = "md",
  style,
  ...rest
}: SkeletonProps) {
  const roundedClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "sm"
      ? "rounded-sm"
      : rounded === "lg"
      ? "rounded-lg"
      : "rounded-md";
  return (
    <div
      role="status"
      aria-hidden="true"
      className={clsx(
        "animate-pulse bg-[var(--bg-surface-muted)]",
        roundedClass,
        className,
      )}
      style={style}
      {...rest}
    />
  );
}

/** Skeleton row for a product card grid. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
      <Skeleton className="aspect-[286/256] w-full" rounded="md" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-[90px]" />
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
  );
}

/** Skeleton row for a table list (orders, customers, etc.). */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}
