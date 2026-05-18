import { clsx } from "@/lib/clsx";

export interface SectionHeaderProps {
  /** Heading level — `h1` for page-defining headings, `h2` for sub-section. */
  as?: "h1" | "h2";
  /** Section title. Renders capitalize + Poppins SemiBold 30/36 #3D3D3D. */
  title: string;
  /** Optional Inter 14/20 #676767 subtitle below the title. */
  subtitle?: string;
  /** Horizontal alignment. `left` is the row layout (with optional action on the right); `center` is hero-style. */
  align?: "left" | "center";
  /** Right-aligned action (e.g. `<ArrowLink href="…">সব দেখুন</ArrowLink>`). Only honoured when align="left". */
  action?: React.ReactNode;
  className?: string;
}

/**
 * SectionHeader — shared title + subtitle block used by every grid-style
 * section across the site.
 *
 * Was previously duplicated verbatim in three places with slightly
 * drifted tracking and line-height — typography drift that the audit
 * caught. Consolidating here lets one source of truth set
 * Figma-precise values:
 *
 *   title    Poppins SemiBold 24 (mobile) → 30 (sm+),
 *            leading-9 (36) on sm+, tracking -0.012em, capitalize, #3D3D3D
 *   subtitle Inter 14/20 weight 400, tracking -0.011em, #676767
 *
 * Used by:
 *   - components/organisms/ProductGridSection (h2 + action)
 *   - components/organisms/CategoryFilterSection (h2, centered, no action)
 *   - app/(marketing)/products/_browser (h1 + action)
 */
export function SectionHeader({
  as: Tag = "h2",
  title,
  subtitle,
  align = "left",
  action,
  className,
}: SectionHeaderProps) {
  const heading = (
    <div className={clsx(align === "center" && "text-center", "space-y-1")}>
      <Tag className="font-poppins font-semibold text-[24px] sm:text-[30px] leading-9 tracking-[-0.012em] capitalize text-[var(--color-text-title)] dark:text-[var(--fg-primary)]">
        {title}
      </Tag>
      {subtitle && (
        <p className="font-inter font-normal text-[14px] leading-5 tracking-[-0.011em] text-[var(--color-text-body)] dark:text-[var(--fg-secondary)]">
          {subtitle}
        </p>
      )}
    </div>
  );

  if (align === "center") {
    return <div className={clsx("mb-12", className)}>{heading}</div>;
  }

  return (
    <div
      className={clsx(
        "flex items-end justify-between gap-4 flex-wrap",
        className,
      )}
    >
      {heading}
      {action}
    </div>
  );
}
