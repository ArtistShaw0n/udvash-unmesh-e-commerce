import { ArrowLink } from "@/components/atoms";
import { ProductCard } from "@/components/molecules";
import type { Book } from "@/lib/books";
import { clsx } from "@/lib/clsx";

export interface ProductGridSectionProps {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  books: Book[];
  tone?: "default" | "muted";
  className?: string;
  /**
   * Optional Figma node id. Wired to `data-figma-id` so the audit runner
   * can map this rendered grid to its source-of-truth design node.
   */
  figmaNodeId?: string;
}

/**
 * ProductGridSection — "জনপ্রিয় বই" style row used on the home page
 * and category landings. Header typography matches the Figma export
 * (Frame 1000003452 group):
 *
 *   Title    Poppins 30px / 36px weight 600, letter-spacing -0.354px,
 *            text-transform capitalize, color #3D3D3D
 *   Subtitle Inter 14px / 20px weight 400, letter-spacing -0.150px,
 *            color #676767
 *   See-all  Poppins 14px / 20px weight 600, color #006D77
 *
 *   The grid below is 1296×520 wide on desktop. Cards are 306px wide
 *   with 24px gap (gap-6) which on a 1296 row gives exactly 4 columns.
 */
export function ProductGridSection({
  title,
  subtitle,
  seeAllHref,
  books,
  tone = "default",
  className,
  figmaNodeId,
}: ProductGridSectionProps) {
  return (
    <section
      data-figma-id={figmaNodeId}
      className={clsx(
        "section-pad-sm",
        tone === "muted" && "bg-[var(--color-bg-page-muted)] dark:bg-[var(--bg-surface-muted)]",
        className,
      )}
    >
      <div className="container-site space-y-12">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h2 className="font-poppins font-semibold text-[24px] sm:text-[30px] leading-9 tracking-[-0.012em] capitalize text-[var(--color-text-title)] dark:text-[var(--fg-primary)]">
              {title}
            </h2>
            {subtitle && (
              <p className="font-inter font-normal text-[14px] leading-5 tracking-[-0.011em] text-[var(--color-text-body)] dark:text-[var(--fg-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          {seeAllHref && <ArrowLink href={seeAllHref}>সব দেখুন</ArrowLink>}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((b) => (
            <ProductCard key={b.slug} book={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
