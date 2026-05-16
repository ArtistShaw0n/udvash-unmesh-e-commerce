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
  /**
   * Save-pill color variant.
   * - "discount" (default): pink bg #FFEDEE + red text #E02D15 — for discount-only cards
   * - "brand": teal bg #E5F0F1 + teal text #006D77 — for best-seller + discount cards
   */
  saveVariant?: "discount" | "brand";
  className?: string;
}

const sizeClass = {
  sm: { price: "text-[20px] leading-[28px]", old: "text-[14px] leading-[20px]" },
  md: { price: "text-[24px] leading-[32px]", old: "text-[16px] leading-[22px]" },
  lg: { price: "text-[32px] leading-[40px]", old: "text-[18px] leading-[24px]" },
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
  size = "sm",
  saveVariant = "discount",
  className,
}: PriceBlockProps) {
  const save = oldPrice ? oldPrice - price : 0;
  const sz = sizeClass[size];

  const savePillClass =
    saveVariant === "brand"
      ? "bg-[#E5F0F1] text-[#006D77]"
      : "bg-[#FFEDEE] text-[#E02D15]";

  return (
    <div
      className={clsx(
        layout === "stacked"
          ? "space-y-1"
          : "flex flex-wrap items-baseline gap-x-2 gap-y-1",
        className,
      )}
    >
      <span
        className={clsx(
          sz.price,
          "font-poppins font-bold tracking-[-0.449px] text-[#3D3D3D] dark:text-white",
        )}
      >
        ৳{format(price, bengali)}
      </span>
      {oldPrice && oldPrice > price && (
        <span
          className={clsx(
            sz.old,
            "font-poppins font-normal tracking-[-0.15px] line-through text-[#A4A4A4]",
          )}
        >
          ৳{format(oldPrice, bengali)}
        </span>
      )}
      {save > 0 && (
        <span
          className={clsx(
            "inline-flex items-center px-1.5 py-0.5 rounded-[4px] font-poppins font-bold text-[12px] leading-4",
            savePillClass,
          )}
        >
          Save ৳{format(save, bengali)}
        </span>
      )}
    </div>
  );
}
