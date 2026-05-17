"use client";

import { ProductGridSection } from "./ProductGridSection";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { getBookBySlug } from "@/lib/books";

export interface RecentlyViewedSectionProps {
  excludeSlug?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Renders the user's recently-viewed books as a horizontal grid section.
 * No-ops when the list is empty (pre-hydration or new user).
 */
export function RecentlyViewedSection({
  excludeSlug,
  title = "সম্প্রতি দেখা বইসমূহ",
  subtitle = "আপনি যেগুলো দেখেছেন",
}: RecentlyViewedSectionProps) {
  const { slugs, hydrated } = useRecentlyViewed(excludeSlug);
  if (!hydrated || slugs.length === 0) return null;

  const books = slugs
    .map((s) => getBookBySlug(s))
    .filter((b): b is NonNullable<typeof b> => !!b)
    .slice(0, 4);

  if (books.length === 0) return null;

  return (
    <ProductGridSection
      title={title}
      subtitle={subtitle}
      books={books}
      tone="muted"
    />
  );
}
