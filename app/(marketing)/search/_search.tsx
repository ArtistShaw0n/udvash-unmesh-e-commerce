"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState, ProductCard, SearchBar } from "@/components/molecules";
import type { Book } from "@/lib/books";
import { toBengaliNumber } from "@/lib/site";

export function SearchClient({ books, initialQ = "" }: { books: Book[]; initialQ?: string }) {
  const [q, setQ] = useState(initialQ);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.titleBn.includes(term) ||
        b.categoryLabel.toLowerCase().includes(term),
    );
  }, [books, q]);

  return (
    <section className="section-pad-sm">
      <div className="container-site space-y-6">
        <div>
          <h1 className="text-h2 text-[var(--fg-primary)]">বই খুঁজুন</h1>
          <p className="text-body text-[var(--fg-secondary)] mt-1">নাম, ক্যাটেগরি বা লেখক দিয়ে খুঁজুন।</p>
        </div>

        <SearchBar value={q} onChange={(e) => setQ(e.target.value)} autoFocus />

        {q.trim() && (
          <p className="text-body-sm text-[var(--fg-muted)]">
            &quot;{q.trim()}&quot; এর জন্য {toBengaliNumber(results.length)}টি ফলাফল পাওয়া গেছে
          </p>
        )}

        {results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((b) => <ProductCard key={b.slug} book={b} />)}
          </div>
        ) : (
          <EmptyState
            icon={<Search size={36} />}
            title="কোনো বই পাওয়া যায়নি"
            description="অন্য শব্দ দিয়ে চেষ্টা করুন বা ক্যাটেগরি ব্রাউজ করুন।"
          />
        )}
      </div>
    </section>
  );
}
