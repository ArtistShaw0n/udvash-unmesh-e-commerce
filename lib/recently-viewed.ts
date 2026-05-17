"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "udvash:recently-viewed-v1";
const MAX_SLUGS = 12;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    /* ignore */
  }
}

/**
 * Push a slug onto the recently-viewed list. Idempotent: moving an
 * already-present slug to the front. Caps the list at MAX_SLUGS.
 */
export function pushRecentlyViewed(slug: string): string[] {
  const current = read();
  const filtered = current.filter((s) => s !== slug);
  const next = [slug, ...filtered].slice(0, MAX_SLUGS);
  write(next);
  return next;
}

/**
 * React hook returning the recently-viewed slug list. Optionally excludes
 * a slug (useful on product detail page to exclude the current product).
 */
export function useRecentlyViewed(exclude?: string): {
  slugs: string[];
  hydrated: boolean;
  clear: () => void;
} {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSlugs(read());
    setHydrated(true);
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setSlugs(read());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setSlugs([]);
  }, []);

  const filtered = exclude ? slugs.filter((s) => s !== exclude) : slugs;
  return { slugs: filtered, hydrated, clear };
}
