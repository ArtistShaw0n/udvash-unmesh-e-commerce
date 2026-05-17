"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Clock, TrendingUp, X } from "lucide-react";
import { getAllBooks, type Book } from "@/lib/books";
import { clsx } from "@/lib/clsx";

const RECENT_KEY = "udvash:recent-searches-v1";
const RECENT_LIMIT = 6;

const TRENDING = [
  "Physics HSC",
  "Chemistry HSC",
  "এডমিশন প্রস্তুতি",
  "মেডিকেল এডমিশন",
  "ক্যাডেট প্রস্তুতি",
];

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string): string[] {
  if (typeof window === "undefined") return [];
  const cleaned = q.trim();
  if (!cleaned) return readRecent();
  const current = readRecent().filter((x) => x.toLowerCase() !== cleaned.toLowerCase());
  const next = [cleaned, ...current].slice(0, RECENT_LIMIT);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

function clearRecent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(RECENT_KEY);
}

function matchBook(book: Book, query: string): boolean {
  const q = query.toLowerCase();
  return (
    book.title.toLowerCase().includes(q) ||
    book.titleBn.includes(query) ||
    book.descriptionBn.includes(query) ||
    book.description.toLowerCase().includes(q) ||
    book.category.toLowerCase().includes(q) ||
    book.author.toLowerCase().includes(q)
  );
}

export interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  /** Optional id for the input (a11y label hooks) */
  inputId?: string;
}

/**
 * Search bar with a dropdown panel that surfaces:
 *  - top product matches as the user types
 *  - recent searches (localStorage)
 *  - trending searches (hardcoded)
 *
 * Submitting (Enter or clicking a result) navigates to /search?q=... and
 * records the query into the recent list.
 */
export function SearchAutocomplete({
  className,
  placeholder = "যেকোনো বই, খাতা ও অন্যান্য খুঁজুন...",
  inputId,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  // Close on outside click / Escape
  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onPointer);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const matches = useMemo<Book[]>(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return [];
    return getAllBooks().filter((b) => matchBook(b, trimmed)).slice(0, 5);
  }, [q]);

  function submit(query: string) {
    const term = query.trim();
    setRecent(pushRecent(term));
    setOpen(false);
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  return (
    <div ref={containerRef} className={clsx("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        className="relative flex items-center w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500"
      >
        <span className="pl-4 text-[var(--fg-muted)] flex items-center pointer-events-none">
          <Search size={18} />
        </span>
        <input
          id={inputId}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label="Search products"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          className="flex-1 bg-transparent px-3 py-2.5 text-body text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] outline-none"
        />
      </form>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card-hover max-h-[60vh] overflow-y-auto"
        >
          {matches.length > 0 ? (
            <Section title="Top matches">
              {matches.map((b) => (
                <Link
                  key={b.slug}
                  href={`/products/${b.slug}`}
                  role="option"
                  onClick={() => {
                    setRecent(pushRecent(q));
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--bg-surface-muted)] transition-colors"
                >
                  <div className="w-10 h-12 rounded bg-[var(--bg-surface-muted)] border border-[var(--border-default)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-[var(--fg-primary)] truncate">
                      {b.titleBn}
                    </p>
                    <p className="text-caption text-[var(--fg-muted)] truncate">
                      {b.categoryLabel} · {b.author}
                    </p>
                  </div>
                </Link>
              ))}
            </Section>
          ) : q.trim().length >= 2 ? (
            <p className="px-4 py-6 text-center text-body-sm text-[var(--fg-muted)]">
              &ldquo;{q}&rdquo; এর জন্য কোন রেজাল্ট নেই
            </p>
          ) : null}

          {recent.length > 0 && q.trim().length < 2 && (
            <Section
              title="সম্প্রতি খোঁজা"
              icon={<Clock size={14} />}
              action={
                <button
                  type="button"
                  onClick={() => {
                    clearRecent();
                    setRecent([]);
                  }}
                  className="text-caption text-[var(--fg-muted)] hover:text-discount-600 inline-flex items-center gap-1"
                >
                  <X size={12} /> Clear
                </button>
              }
            >
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="option"
                  onClick={() => submit(r)}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--bg-surface-muted)] transition-colors"
                >
                  <Clock size={14} className="text-[var(--fg-muted)] flex-shrink-0" />
                  <span className="text-body-sm text-[var(--fg-secondary)] truncate">{r}</span>
                </button>
              ))}
            </Section>
          )}

          {q.trim().length < 2 && (
            <Section title="ট্রেন্ডিং" icon={<TrendingUp size={14} />}>
              {TRENDING.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="option"
                  onClick={() => submit(t)}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--bg-surface-muted)] transition-colors"
                >
                  <TrendingUp size={14} className="text-[var(--fg-muted)] flex-shrink-0" />
                  <span className="text-body-sm text-[var(--fg-secondary)] truncate">{t}</span>
                </button>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-2 border-b border-[var(--border-muted)] last:border-b-0">
      <div className="flex items-center justify-between px-2 py-1">
        <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-1.5">
          {icon} {title}
        </p>
        {action}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
