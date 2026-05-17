import { clsx } from "@/lib/clsx";

export interface FilterPillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /**
   * Visual scale. `default` = roomy chip (home category bar, ~52px tall).
   * `compact` = tighter chip (used inside dense toolbars like /products).
   */
  size?: "default" | "compact";
}

/**
 * FilterPill — category chip used by CategoryFilterSection and the
 * /products toolbar. Pixel spec sourced from the Figma export
 * (`udvash-roadmap copy.docx` → Frame 1000003465 family):
 *
 *   Inactive
 *     bg #F2F8F8, border 1px solid #F2F8F8, border-radius 10px,
 *     padding 8px 36px, color #006D77,
 *     Poppins 18px / 36px weight 600, letter-spacing -0.354px
 *
 *   Active
 *     bg #006D77, color #FFFFFF, same border-radius + padding
 *
 *   Focus
 *     2px brand ring + 2px offset (a11y)
 *
 *   `size="compact"` shrinks padding/text for /products-style toolbars
 *   so the home-page chip and the dense filter row don't collide on
 *   layout.
 */
export function FilterPill({
  active = false,
  size = "default",
  className,
  children,
  type = "button",
  ...rest
}: FilterPillProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={clsx(
        // Shared
        "inline-flex items-center justify-center rounded-[10px] border transition-colors whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        // Size
        size === "default"
          ? "px-9 py-2 font-poppins text-[18px] leading-9 font-semibold tracking-[-0.02em]"
          : "px-4 py-1.5 text-body-sm font-semibold",
        // State
        active
          ? "bg-[#006D77] text-white border-[#006D77] hover:bg-[#005a63] hover:border-[#005a63]"
          : "bg-[#F2F8F8] text-[#006D77] border-[#F2F8F8] hover:bg-[#e6f0f0] dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-900/20",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
