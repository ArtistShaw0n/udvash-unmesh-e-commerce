"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dropdown } from "@/components/atoms/Dropdown";
import { LoadMoreButton, ProductCard, SectionHeader } from "@/components/molecules";
import { CategoryFilterSection } from "@/components/organisms";
import { CATEGORIES, toBengaliNumber } from "@/lib/site";
import type { Book } from "@/lib/books";

// Figma 9:6555 grid is 5 rows × 4 cols = 20 cards initial load.
const PER_PAGE = 20;

type SortValue = "popular" | "newest" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS = [
  { label: "জনপ্রিয়", value: "popular" },
  { label: "নতুন আগে", value: "newest" },
  { label: "মূল্য কম → বেশি", value: "price-asc" },
  { label: "মূল্য বেশি → কম", value: "price-desc" },
  { label: "রেটিং", value: "rating" },
];

interface Filters {
  category: string;
  sort: SortValue;
}

function readFromUrl(params: URLSearchParams): Filters {
  return {
    category: params.get("category") ?? "all",
    sort: (params.get("sort") as SortValue) ?? "popular",
  };
}

function writeToUrl(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.category !== "all") p.set("category", f.category);
  if (f.sort !== "popular") p.set("sort", f.sort);
  return p;
}

export function ProductsBrowser({ books }: { books: Book[] }) {
  return (
    <Suspense fallback={<div className="section-pad-sm container-site">Loading…</div>}>
      <ProductsBrowserInner books={books} />
    </Suspense>
  );
}

/**
 * /products — Figma node 9:6555.
 *
 *   Layout (1920 frame, 312 gutters → 1296 content):
 *     Category section   1920×270 — centered title "Category" (Poppins
 *                        SemiBold 30) + 7-pill row, 52px tall, gap 12
 *     Main block         1920×3602, padding 312 → 1296 content
 *       Toolbar          1296×56 — left: h1 "সকল বই" 36px + subtitle
 *                        "Academic সেকশনের জনপ্রিয় বিক্রিত বইসমূহ" 20px;
 *                        right: sort dropdown 145×40
 *       Grid             5 rows × 4 cols, card 306×520, col-gap 24,
 *                        row-gap 50
 *       Load more        152×34 button + "Showing X of Y products"
 *                        counter beneath
 *
 *   The earlier "compact sidebar" variant of this page is gone — Figma
 *   doesn't have it. URL params are kept for `category` and `sort` only.
 */
function ProductsBrowserInner({ books }: { books: Book[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => readFromUrl(searchParams));
  const [page, setPage] = useState(1);

  // Push filter state back into the URL for shareable filtered pages
  useEffect(() => {
    const params = writeToUrl(filters);
    const url = params.toString() ? `?${params}` : "";
    router.replace(`/products${url}`, { scroll: false });
  }, [filters, router]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }

  const filtered = useMemo(
    () =>
      filters.category === "all"
        ? books
        : books.filter((b) => b.category === filters.category),
    [books, filters.category],
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (filters.sort) {
      case "newest":
        return arr.reverse();
      case "price-asc":
        return arr.sort((a, b) => a.price - b.price);
      case "price-desc":
        return arr.sort((a, b) => b.price - a.price);
      case "rating":
        // No rating field on Book — bestsellers first as proxy.
        return arr.sort((a, b) => {
          const aBest = a.badge?.type === "bestseller" ? 1 : 0;
          const bBest = b.badge?.type === "bestseller" ? 1 : 0;
          return bBest - aBest;
        });
      default:
        return arr;
    }
  }, [filtered, filters.sort]);

  const visible = sorted.slice(0, page * PER_PAGE);
  const hasMore = visible.length < sorted.length;

  return (
    <>
      <CategoryFilterSection
        title="Category"
        variant="centered"
        categories={[...CATEGORIES]}
        defaultCategory={filters.category}
        onChange={(slug) => updateFilter("category", slug)}
      />

      <section className="section-pad-sm">
        <div className="container-site space-y-8">
          {/* Toolbar — Figma 9:6571 1296×56.
              Left: h1 "সকল বই" + subtitle via SectionHeader.
              Right: sort dropdown 145×40 anchored top-right. */}
          <SectionHeader
            as="h1"
            title="সকল বই"
            subtitle="Academic সেকশনের জনপ্রিয় বিক্রিত বইসমূহ"
            action={
              <Dropdown
                options={SORT_OPTIONS}
                defaultValue={filters.sort}
                onChange={(v) => updateFilter("sort", v as SortValue)}
              />
            }
          />

          {/* Grid — full-width 4-col on lg+, 24px col gap, 50px row gap (Figma). */}
          {visible.length > 0 ? (
            <div className="grid gap-x-6 gap-y-[50px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {visible.map((b) => (
                <ProductCard key={b.slug} book={b} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-body text-[var(--fg-muted)] rounded-md border border-dashed border-[var(--border-default)]">
              এই ক্যাটাগরিতে কোনো বই পাওয়া যায়নি।
            </div>
          )}

          {/* Load-more + counter — Figma 9:7230. Counter shows total/visible
              regardless of hasMore so users can see the page size. */}
          <div className="flex flex-col items-center gap-3 pt-2">
            {hasMore && <LoadMoreButton onClick={() => setPage((p) => p + 1)} />}
            <p className="font-poppins font-normal text-[14px] leading-4 text-[var(--color-text-body)] dark:text-[var(--fg-muted)]">
              Showing {toBengaliNumber(visible.length)} of {toBengaliNumber(sorted.length)}{" "}
              products
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
