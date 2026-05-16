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

const STORAGE_KEY = "udvash:wishlist-v1";

export interface WishlistContextValue {
  slugs: string[];
  hydrated: boolean;
  count: number;
  has: (slug: string) => boolean;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  toggle: (slug: string) => boolean; // returns the new state
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const writeRef = useRef(false);

  useEffect(() => {
    setSlugs(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!writeRef.current) {
      writeRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      /* ignore */
    }
  }, [slugs, hydrated]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      setSlugs(readFromStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((slug: string) => {
    setSlugs((prev) => (prev.includes(slug) ? prev : [slug, ...prev]));
  }, []);

  const remove = useCallback((slug: string) => {
    setSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const toggle = useCallback((slug: string): boolean => {
    let added = false;
    setSlugs((prev) => {
      if (prev.includes(slug)) {
        added = false;
        return prev.filter((s) => s !== slug);
      }
      added = true;
      return [slug, ...prev];
    });
    return added;
  }, []);

  const clear = useCallback(() => setSlugs([]), []);

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
