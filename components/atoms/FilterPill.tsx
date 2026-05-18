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
        "inline-flex items-center justify-center rounded-md border transition-colors whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        // Size
        size === "default"
          ? "px-9 py-2 font-poppins text-[18px] leading-9 font-semibold tracking-[-0.02em]"
          : "px-4 py-1.5 text-body-sm font-semibold",
        // State — all colours via brand-* tokens so a palette change
        // ripples through every filter chip on the site.
        active
          ? "bg-brand-600 text-white border-brand-600 hover:bg-brand-700 hover:border-brand-700"
          : "bg-brand-50 text-brand-600 border-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-300 dark:border-brand-900/20",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
