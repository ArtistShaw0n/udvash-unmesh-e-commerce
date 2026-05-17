"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "./api-client";
import { useAuth } from "./auth-context";

export interface WishlistContextValue {
  slugs: string[];
  hydrated: boolean;
  count: number;
  has: (slug: string) => boolean;
  add: (slug: string) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  /** Toggle a slug. Returns the new state (true = added). */
  toggle: (slug: string) => Promise<boolean>;
  clear: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, hydrated: authHydrated } = useAuth();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load wishlist from server when logged in; clear when logged out
  useEffect(() => {
    if (!authHydrated) return;
    if (!isLoggedIn) {
      setSlugs([]);
      setHydrated(true);
      return;
    }
    let cancelled = false;
    void api.getWishlist().then((r) => {
      if (cancelled) return;
      if (r.ok) setSlugs(r.data.slugs);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authHydrated, isLoggedIn]);

  const add = useCallback(
    async (slug: string) => {
      if (slugs.includes(slug)) return;
      // optimistic
      setSlugs((prev) => [slug, ...prev]);
      const result = await api.toggleWishlist(slug);
      // If it was already there (shouldn't happen here) or call failed, refetch
      if (!result.ok || !result.data.added) {
        const r = await api.getWishlist();
        if (r.ok) setSlugs(r.data.slugs);
      }
    },
    [slugs],
  );

  const remove = useCallback(
    async (slug: string) => {
      if (!slugs.includes(slug)) return;
      setSlugs((prev) => prev.filter((s) => s !== slug));
      const result = await api.toggleWishlist(slug);
      if (!result.ok || result.data.added) {
        const r = await api.getWishlist();
        if (r.ok) setSlugs(r.data.slugs);
      }
    },
    [slugs],
  );

  const toggle = useCallback(
    async (slug: string): Promise<boolean> => {
      const wasPresent = slugs.includes(slug);
      // optimistic
      setSlugs((prev) =>
        wasPresent ? prev.filter((s) => s !== slug) : [slug, ...prev],
      );
      const result = await api.toggleWishlist(slug);
      if (!result.ok) {
        // revert
        setSlugs((prev) =>
          wasPresent ? [slug, ...prev.filter((s) => s !== slug)] : prev.filter((s) => s !== slug),
        );
        return wasPresent;
      }
      return result.data.added;
    },
    [slugs],
  );

  const clear = useCallback(async () => {
    // No clear endpoint — toggle each off (could be batched on server later)
    const current = [...slugs];
    setSlugs([]);
    await Promise.all(current.map((s) => api.toggleWishlist(s)));
  }, [slugs]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      slugs,
      hydrated,
      count: slugs.length,
      has: (slug) => slugs.includes(slug),
      add,
      remove,
      toggle,
      clear,
    }),
    [slugs, hydrated, add, remove, toggle, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist() must be used within <WishlistProvider>");
  return ctx;
}
