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
import { api } from "./api-client";
import { useAuth } from "./auth-context";

export interface Review {
  id: string;
  slug: string;
  userId: string;
  authorName: string;
  rating: number;
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
  /** Get reviews for a slug (fetches on first access, caches after). */
  forSlug: (slug: string) => Review[];
  summaryFor: (slug: string) => ReviewSummary;
  hasReviewed: (slug: string) => boolean;
  /** Ensure reviews for this slug are loaded — call on mount. */
  ensureLoaded: (slug: string) => Promise<void>;
  /** Add a review. Returns the review id or null on failure. */
  addReview: (input: {
    slug: string;
    rating: number;
    title: string;
    body: string;
  }) => Promise<{ ok: true; id: string } | { ok: false; error: string }>;
}

const ReviewsContext = createContext<ReviewsStoreValue | null>(null);

const EMPTY_DIST: ReviewSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bySlug, setBySlug] = useState<Record<string, Review[]>>({});
  const [summaryBySlug, setSummaryBySlug] = useState<Record<string, ReviewSummary>>({});
  const loadingSlugs = useRef<Set<string>>(new Set());

  const ensureLoaded = useCallback(
    async (slug: string) => {
      if (bySlug[slug] || loadingSlugs.current.has(slug)) return;
      loadingSlugs.current.add(slug);
      const r = await api.listReviews(slug);
      loadingSlugs.current.delete(slug);
      if (r.ok) {
        setBySlug((prev) => ({ ...prev, [slug]: r.data.reviews as Review[] }));
        setSummaryBySlug((prev) => ({
          ...prev,
          [slug]: {
            count: r.data.summary.count,
            average: r.data.summary.average,
            distribution: (r.data.summary.distribution as unknown) as ReviewSummary["distribution"],
          },
        }));
      }
    },
    [bySlug],
  );

  // Auto-reset on logout so "hasReviewed" doesn't leak across sessions
  useEffect(() => {
    if (!user) {
      // keep cached reviews (they're public anyway) but clear so we re-fetch fresh
      setBySlug({});
      setSummaryBySlug({});
    }
  }, [user]);

  const addReview = useCallback<ReviewsStoreValue["addReview"]>(
    async (input) => {
      const r = await api.postReview(input.slug, {
        rating: input.rating,
        title: input.title,
        body: input.body,
      });
      if (!r.ok) return { ok: false, error: r.error };

      const review = r.data.review as Review;
      setBySlug((prev) => ({
        ...prev,
        [input.slug]: [review, ...(prev[input.slug] ?? [])],
      }));
      // Refresh summary
      const fresh = await api.listReviews(input.slug);
      if (fresh.ok) {
        setSummaryBySlug((prev) => ({
          ...prev,
          [input.slug]: {
            count: fresh.data.summary.count,
            average: fresh.data.summary.average,
            distribution: (fresh.data.summary.distribution as unknown) as ReviewSummary["distribution"],
          },
        }));
      }
      return { ok: true, id: review.id };
    },
    [],
  );

  const value = useMemo<ReviewsStoreValue>(
    () => ({
      forSlug: (slug) => bySlug[slug] ?? [],
      summaryFor: (slug) =>
        summaryBySlug[slug] ?? { count: 0, average: 0, distribution: EMPTY_DIST },
      hasReviewed: (slug) =>
        user ? (bySlug[slug] ?? []).some((r) => r.userId === user.id) : false,
      ensureLoaded,
      addReview,
    }),
    [bySlug, summaryBySlug, user, ensureLoaded, addReview],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews(): ReviewsStoreValue {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews() must be used within <ReviewsProvider>");
  return ctx;
}
