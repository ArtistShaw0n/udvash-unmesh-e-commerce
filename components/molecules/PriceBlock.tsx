import { clsx } from "@/lib/clsx";
import { toBengaliNumber } from "@/lib/site";

export interface PriceBlockProps {
  price: number;
  oldPrice?: number;
  /** Use Bengali numerals (default true). */
  bengali?: boolean;
  /** Stack price + old vertically, or inline. */
  layout?: "inline" | "stacked";
  /** Larger price emphasis for product detail page. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClass = {
  sm: { price: "text-h4 font-bold", old: "text-body-sm" },
  md: { price: "text-h3 font-bold", old: "text-body" },
  lg: { price: "text-h2 font-bold", old: "text-body-lg" },
};

function format(value: number, bengali: boolean): string {
  const s = value.toString();
  return bengali ? toBengaliNumber(s) : s;
}

export function PriceBlock({
  price,
  oldPrice,
  bengali = true,
  layout = "inline",
  size = "md",
  className,
}: PriceBlockProps) {
  const save = oldPrice ? oldPrice - price : 0;
  const sz = sizeClass[size];
  return (
    <div className={clsx(layout === "stacked" ? "space-y-1" : "flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={clsx(sz.price, "text-[var(--fg-primary)]")}>
        ৳{format(price, bengali)}
      </span>
      {oldPrice && oldPrice > price && (
        <span className={clsx(sz.old, "text-[var(--fg-muted)] line-through")}>
          ৳{format(oldPrice, bengali)}
        </span>
      )}
      {save > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-success-100 text-success-700 dark:bg-success-700/20 dark:text-success-400 text-caption font-bold">
          Save ৳{format(save, bengali)}
        </span>
      )}
    </div>
  );
}
