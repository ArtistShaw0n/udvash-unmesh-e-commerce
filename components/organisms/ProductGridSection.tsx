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
}

export function ProductGridSection({
  title,
  subtitle,
  seeAllHref,
  books,
  tone = "default",
  className,
}: ProductGridSectionProps) {
  return (
    <section
      className={clsx(
        "section-pad-sm",
        tone === "muted" && "bg-[var(--bg-surface-muted)]",
        className,
      )}
    >
      <div className="container-site space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-h2 text-[var(--fg-primary)]">{title}</h2>
            {subtitle && (
              <p className="text-body-sm text-[var(--fg-secondary)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {seeAllHref && <ArrowLink href={seeAllHref}>সব দেখুন</ArrowLink>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((b) => (
            <ProductCard key={b.slug} book={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
