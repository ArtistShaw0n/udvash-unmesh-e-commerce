"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "udvash:reviews-v1";

export interface Review {
  id: string;
  slug: string;          // book slug this review is for
  authorEmail: string;
  authorName: string;
  rating: number;        // 1-5
  title: string;
  body: string;
  createdAt: number;
  verifiedPurchase: boolean;
}

export interface ReviewSummary {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface ReviewsStoreValue {
  reviews: Review[];
  hydrated: boolean;
  /** All reviews for a slug, newest first. */
  forSlug: (slug: string) => Review[];
  /** Aggregated summary (count, average, distribution). */
  summaryFor: (slug: string) => ReviewSummary;
  /** Whether `email` has already posted a review for this slug. */
  hasReviewed: (slug: string, email: string) => boolean;
  /** Add a new review. */
  addReview: (input: Omit<Review, "id" | "createdAt">) => string;
}

const ReviewsContext = createContext<ReviewsStoreValue | null>(null);

// Seed a few demo reviews for the most popular books.
const SEED_REVIEWS: Omit<Review, "id" | "createdAt">[] = [
  {
    slug: "udvash-physics-parallel-text-hsc-2026",
    authorEmail: "tania@example.com",
    authorName: "Tania Akter",
    rating: 5,
    title: "অসাধারণ বই",
    body: "ব্যাখ্যা পরিষ্কার, প্রশ্নসংখ্যা যথেষ্ট। HSC পরীক্ষার জন্য must-have।",
    verifiedPurchase: true,
  },
  {
    slug: "udvash-physics-parallel-text-hsc-2026",
    authorEmail: "rakib@example.com",
    authorName: "Rakib Hasan",
    rating: 4,
    title: "ভালো কিন্তু কিছু টপিক ছোট",
    body: "অধিকাংশ চ্যাপ্টার দারুণ। তবে কিছু চ্যাপ্টারে আরও উদাহরণ থাকলে ভালো হতো।",
    verifiedPurchase: true,
  },
  {
    slug: "udvash-chemistry-parallel-text-hsc-2026",
    authorEmail: "fatima@example.com",
    authorName: "Fatima Sultana",
    rating: 5,
    title: "সেরা চয়েস",
    body: "Concept + practice — দুটোই এক বইতে। দাম-অনুপাতে best।",
    verifiedPurchase: true,
  },
];

function readFromStorage(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First visit — seed demo reviews
      const seeded: Review[] = SEED_REVIEWS.map((r, i) => ({
        ...r,
        id: `seed-${i}`,
        createdAt: Date.now() - (i + 1) * 86400000 * 3,
      }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const writeRef = useRef(false);

  useEffect(() => {
    setReviews(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!writeRef.current) {
      writeRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      /* ignore */
    }
  }, [reviews, hydrated]);

  const addReview = useCallback(
    (input: Omit<Review, "id" | "createdAt">): string => {
      const id = Math.random().toString(36).slice(2, 10);
      const next: Review = { ...input, id, createdAt: Date.now() };
      setReviews((prev) => [next, ...prev]);
      return id;
    },
    [],
  );

  const value = useMemo<ReviewsStoreValue>(() => {
    const byEmailSlug = new Map<string, true>();
    for (const r of reviews) {
      byEmailSlug.set(`${r.slug}::${r.authorEmail.toLowerCase()}`, true);
    }
    return {
      reviews,
      hydrated,
      forSlug: (slug) =>
        reviews
          .filter((r) => r.slug === slug)
          .sort((a, b) => b.createdAt - a.createdAt),
      summaryFor: (slug) => {
        const list = reviews.filter((r) => r.slug === slug);
        const count = list.length;
        const dist: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        for (const r of list) {
          const k = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
          dist[k] += 1;
          sum += r.rating;
        }
        return {
          count,
          average: count > 0 ? Number((sum / count).toFixed(1)) : 0,
          distribution: dist,
        };
      },
      hasReviewed: (slug, email) =>
        byEmailSlug.has(`${slug}::${email.toLowerCase()}`),
      addReview,
    };
  }, [reviews, hydrated, addReview]);

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews(): ReviewsStoreValue {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews() must be used within <ReviewsProvider>");
  return ctx;
}
