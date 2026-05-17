"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button, Checkbox } from "@/components/atoms";
import { Dropdown } from "@/components/atoms/Dropdown";
import { LoadMoreButton, ProductCard } from "@/components/molecules";
import { CategoryFilterSection } from "@/components/organisms";
import { CATEGORIES, toBengaliNumber } from "@/lib/site";
import type { Book } from "@/lib/books";
import { clsx } from "@/lib/clsx";

const PER_PAGE = 8;

type SortValue = "popular" | "newest" | "price-asc" | "price-desc" | "rating";

const SORT_OPTIONS = [
  { label: "জনপ্রিয়", value: "popular" },
  { label: "নতুন আগে", value: "newest" },
  { label: "মূল্য কম → বেশি", value: "price-asc" },
  { label: "মূল্য বেশি → কম", value: "price-desc" },
  { label: "রেটিং", value: "rating" },
];

const PRICE_BRACKETS = [
  { label: "সব দাম", min: 0, max: Infinity },
  { label: "৳০ — ৳৫০০", min: 0, max: 500 },
  { label: "৳৫০০ — ৳১০০০", min: 500, max: 1000 },
  { label: "৳১০০০ — ৳২০০০", min: 1000, max: 2000 },
  { label: "৳২০০০+", min: 2000, max: Infinity },
];

interface Filters {
  category: string;
  sort: SortValue;
  priceIdx: number;
  freeDelivery: boolean;
  inStockOnly: boolean;
  discountOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  category: "all",
  sort: "popular",
  priceIdx: 0,
  freeDelivery: false,
  inStockOnly: false,
  discountOnly: false,
};

function readFromUrl(params: URLSearchParams): Filters {
  return {
    category: params.get("category") ?? "all",
    sort: (params.get("sort") as SortValue) ?? "popular",
    priceIdx: Math.max(
      0,
      Math.min(PRICE_BRACKETS.length - 1, Number(params.get("price") ?? 0)),
    ),
    freeDelivery: params.get("free") === "1",
    inStockOnly: params.get("instock") === "1",
    discountOnly: params.get("discount") === "1",
  };
}

function writeToUrl(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.category !== "all") p.set("category", f.category);
  if (f.sort !== "popular") p.set("sort", f.sort);
  if (f.priceIdx > 0) p.set("price", String(f.priceIdx));
  if (f.freeDelivery) p.set("free", "1");
  if (f.inStockOnly) p.set("instock", "1");
  if (f.discountOnly) p.set("discount", "1");
  return p;
}

export function ProductsBrowser({ books }: { books: Book[] }) {
  return (
    <Suspense fallback={<div className="section-pad-sm container-site">Loading…</div>}>
      <ProductsBrowserInner books={books} />
    </Suspense>
  );
}

function ProductsBrowserInner({ books }: { books: Book[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => readFromUrl(searchParams));
  const [page, setPage] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const filtered = useMemo(() => {
    const bracket = PRICE_BRACKETS[filters.priceIdx];
    return books.filter((b) => {
      if (filters.category !== "all" && b.category !== filters.category) return false;
      if (b.price < bracket.min || b.price > bracket.max) return false;
      if (filters.freeDelivery && !b.freeDelivery) return false;
      if (filters.inStockOnly && b.stock !== "in-stock") return false;
      if (filters.discountOnly && (!b.oldPrice || b.oldPrice <= b.price)) return false;
      return true;
    });
  }, [books, filters]);

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
        // Without ratings on Book, fall back to bestsellers first
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

  const activeCount =
    (filters.priceIdx > 0 ? 1 : 0) +
    (filters.freeDelivery ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.discountOnly ? 1 : 0);

  function reset() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  // Desktop sidebar and mobile drawer both render this panel — same
  // controls, separate inputs. Prefix IDs so labels resolve to the right
  // input (duplicate IDs are an a11y violation and break `htmlFor`).
  const renderFilterPanel = (scope: "desktop" | "mobile") => (
    <div className="space-y-5">
      <Section title="দাম">
        <div className="space-y-1.5">
          {PRICE_BRACKETS.map((b, i) => (
            <label key={b.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`price-${scope}`}
                checked={filters.priceIdx === i}
                onChange={() => updateFilter("priceIdx", i)}
                className="accent-brand-600"
              />
              <span className="text-body-sm text-[var(--fg-secondary)]">{b.label}</span>
            </label>
          ))}
        </div>
      </Section>
      <Section title="অপশন">
        <div className="space-y-2">
          <Checkbox
            id={`${scope}-ff-free`}
            label="ফ্রি ডেলিভারি"
            checked={filters.freeDelivery}
            onChange={(e) => updateFilter("freeDelivery", e.target.checked)}
          />
          <Checkbox
            id={`${scope}-ff-stock`}
            label="স্টকে আছে"
            checked={filters.inStockOnly}
            onChange={(e) => updateFilter("inStockOnly", e.target.checked)}
          />
          <Checkbox
            id={`${scope}-ff-disc`}
            label="ডিসকাউন্ট চলছে"
            checked={filters.discountOnly}
            onChange={(e) => updateFilter("discountOnly", e.target.checked)}
          />
        </div>
      </Section>
      {activeCount > 0 && (
        <Button variant="secondary" size="sm" fullWidth onClick={reset}>
          সব ফিল্টার রিসেট
        </Button>
      )}
    </div>
  );

  return (
    <>
      <CategoryFilterSection
        title="ক্যাটাগরি"
        variant="compact"
        categories={[...CATEGORIES]}
        defaultCategory={filters.category}
        onChange={(slug) => updateFilter("category", slug)}
      />

      <section className="section-pad-sm">
        <div className="container-site space-y-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-h2 text-[var(--fg-primary)]">সকল বই</h2>
              <p className="text-body-sm text-[var(--fg-secondary)] mt-1">
                {toBengaliNumber(filtered.length)} টি বই পাওয়া গেছে
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden relative inline-flex items-center gap-1.5 h-10 px-3 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] text-body-sm font-semibold text-[var(--fg-primary)]"
              >
                <Filter size={14} /> ফিল্টার
                {activeCount > 0 && (
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-brand-600 text-white text-caption font-bold">
                    {activeCount}
                  </span>
                )}
              </button>
              <Dropdown
                options={SORT_OPTIONS}
                defaultValue={filters.sort}
                onChange={(v) => updateFilter("sort", v as SortValue)}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[240px_1fr] min-w-0 [&>*]:min-w-0">
            <aside className="hidden lg:block sticky top-24 self-start rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-card">
              {renderFilterPanel("desktop")}
            </aside>

            <div>
              {visible.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visible.map((b) => (
                    <ProductCard key={b.slug} book={b} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-body text-[var(--fg-muted)] rounded-lg border border-dashed border-[var(--border-default)]">
                  কোনো বই এই ফিল্টারে পাওয়া যায়নি।
                  <div className="mt-3">
                    <Button variant="secondary" size="sm" onClick={reset}>
                      ফিল্টার রিসেট
                    </Button>
                  </div>
                </div>
              )}

              {hasMore && (
                <div className="text-center pt-6">
                  <LoadMoreButton onClick={() => setPage((p) => p + 1)} />
                </div>
              )}

              <p className="text-center text-body-sm text-[var(--fg-muted)] pt-4">
                {toBengaliNumber(sorted.length)}টি বইয়ের মধ্যে {toBengaliNumber(visible.length)}টি দেখানো হচ্ছে
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <div
        className={clsx(
          "lg:hidden fixed inset-0 z-50 transition-opacity",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        <div
          className={clsx(
            "absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-[var(--bg-surface)] shadow-card-hover transition-transform overflow-y-auto",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
          role="dialog"
          aria-label="Filters"
        >
          <div className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--border-default)] flex items-center justify-between p-4">
            <h3 className="text-h4 text-[var(--fg-primary)]">ফিল্টার</h3>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close filters"
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--bg-surface-muted)]"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-5">{renderFilterPanel("mobile")}</div>
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}
