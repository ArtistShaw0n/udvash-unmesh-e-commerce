"use client";

import { useMemo, useState } from "react";
import { Dropdown } from "@/components/atoms/Dropdown";
import { LoadMoreButton, ProductCard } from "@/components/molecules";
import {
  CategoryFilterSection,
} from "@/components/organisms";
import { CATEGORIES, toBengaliNumber } from "@/lib/site";
import type { Book } from "@/lib/books";

const PER_PAGE = 8;

type SortValue = "popular" | "newest" | "price-asc" | "price-desc";

const SORT_OPTIONS = [
  { label: "সবগুলো", value: "popular" },
  { label: "নতুন আগে", value: "newest" },
  { label: "মূল্য কম → বেশি", value: "price-asc" },
  { label: "মূল্য বেশি → কম", value: "price-desc" },
];

export function ProductsBrowser({ books }: { books: Book[] }) {
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortValue>("popular");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (category === "all") return books;
    return books.filter((b) => b.category === category);
  }, [books, category]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "newest") return arr.reverse();
    if (sort === "price-asc") return arr.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return arr.sort((a, b) => b.price - a.price);
    return arr;
  }, [filtered, sort]);

  const visible = sorted.slice(0, page * PER_PAGE);
  const hasMore = visible.length < sorted.length;

  return (
    <>
      <CategoryFilterSection
        title="Category"
        variant="compact"
        categories={[...CATEGORIES]}
        defaultCategory="all"
        onChange={(slug) => {
          setCategory(slug);
          setPage(1);
        }}
      />

      <section className="section-pad-sm">
        <div className="container-site space-y-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-h2 text-[var(--fg-primary)]">সকল বই</h2>
              <p className="text-body-sm text-[var(--fg-secondary)] mt-1">
                Academic সেক্টরের জনপ্রিয় বিভিন্ন বইসমূহ
              </p>
            </div>
            <Dropdown
              options={SORT_OPTIONS}
              defaultValue="popular"
              onChange={(v) => setSort(v as SortValue)}
            />
          </div>

          {visible.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visible.map((b) => (
                <ProductCard key={b.slug} book={b} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-body text-[var(--fg-muted)]">
              এই ক্যাটেগরিতে কোন বই পাওয়া যায়নি।
            </div>
          )}

          {hasMore && (
            <div className="text-center pt-4">
              <LoadMoreButton onClick={() => setPage((p) => p + 1)} />
            </div>
          )}

          <p className="text-center text-body-sm text-[var(--fg-muted)] pt-2">
            Showing {toBengaliNumber(visible.length)} of {toBengaliNumber(sorted.length)} products
          </p>
        </div>
      </section>
    </>
  );
}
