import { clsx } from "@/lib/clsx";

export interface StockOutOverlayProps {
  className?: string;
  label?: string;
}

/**
 * Stock-out "sticker" overlay applied across a ProductCard image.
 * Renders a rotated stamp-like graphic with notched ends.
 */
export function StockOutOverlay({
  className,
  label = "STOCK OUT",
}: StockOutOverlayProps) {
  return (
    <div
      className={clsx(
        "absolute inset-0 flex items-center justify-center bg-neutral-300/40 dark:bg-neutral-900/40 backdrop-blur-[1px]",
        className,
      )}
      aria-label="Stock out"
    >
      <div className="relative -rotate-12 select-none">
        {/* Main label panel */}
        <div className="bg-neutral-700 dark:bg-neutral-800 text-white px-6 py-2 shadow-card-hover">
          <span className="text-h4 font-black tracking-[0.18em]">{label}</span>
        </div>
        {/* Top + bottom notches (ribbon look) */}
        <span className="absolute -top-1 left-2 w-2 h-2 bg-neutral-700 dark:bg-neutral-800 rounded-full" />
        <span className="absolute -top-1 right-2 w-2 h-2 bg-neutral-700 dark:bg-neutral-800 rounded-full" />
        <span className="absolute -bottom-1 left-2 w-2 h-2 bg-neutral-700 dark:bg-neutral-800 rounded-full" />
        <span className="absolute -bottom-1 right-2 w-2 h-2 bg-neutral-700 dark:bg-neutral-800 rounded-full" />
      </div>
    </div>
  );
}
