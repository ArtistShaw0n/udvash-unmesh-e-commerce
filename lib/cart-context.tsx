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

const STORAGE_KEY = "udvash:cart-v1";

export interface CartItem {
  slug: string;
  quantity: number;
  selected: boolean;
}

export interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  getQuantity: (slug: string) => number;
  has: (slug: string) => boolean;
  addItem: (slug: string, qty?: number) => Promise<void>;
  removeItem: (slug: string) => Promise<void>;
  setQuantity: (slug: string, qty: number) => Promise<void>;
  toggleSelected: (slug: string) => Promise<void>;
  toggleSelectAll: () => Promise<void>;
  clearCart: () => Promise<void>;
  clearSelected: () => Promise<void>;
  itemCount: number;
  uniqueCount: number;
  selectedCount: number;
  allSelected: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Hybrid cart strategy:
 *   - Logged in: persisted server-side via /api/cart, mirror in state
 *   - Logged out: persisted in localStorage (so guests can build a cart)
 *
 * On login the local guest cart could be merged via a sync step — for now
 * we keep them separate. Both modes expose the same hook API so the UI
 * doesn't change.
 */

function readLocal(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(items: CartItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, hydrated: authHydrated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  // Track the previous logged-in state so we know when to refetch
  const lastLoggedIn = useRef<boolean | null>(null);

  // Hydrate cart whenever auth state settles
  useEffect(() => {
    if (!authHydrated) return;
    let cancelled = false;

    async function hydrate() {
      if (isLoggedIn) {
        const r = await api.getCart();
        if (cancelled) return;
        if (r.ok) {
          const fromServer: CartItem[] = (r.data.items as Array<{
            slug: string;
            quantity: number;
            selected: boolean;
          }>).map((i) => ({
            slug: i.slug,
            quantity: i.quantity,
            selected: i.selected,
          }));
          setItems(fromServer);
        }
      } else {
        setItems(readLocal());
      }
      setHydrated(true);
      lastLoggedIn.current = isLoggedIn;
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [authHydrated, isLoggedIn]);

  // Persist guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!hydrated || isLoggedIn) return;
    writeLocal(items);
  }, [items, hydrated, isLoggedIn]);

  // Helpers that pick the right backend ----------------------------

  const addItem = useCallback(
    async (slug: string, qty = 1) => {
      if (qty <= 0) return;
      // Optimistic update
      setItems((prev) => {
        const existing = prev.find((i) => i.slug === slug);
        if (existing) {
          return prev.map((i) =>
            i.slug === slug
              ? { ...i, quantity: Math.min(99, i.quantity + qty) }
              : i,
          );
        }
        return [...prev, { slug, quantity: Math.min(99, qty), selected: true }];
      });
      if (isLoggedIn) {
        const result = await api.addToCart(slug, qty);
        if (!result.ok) {
          // Refetch on failure to ensure consistency
          const r = await api.getCart();
          if (r.ok) {
            setItems(
              (r.data.items as Array<{ slug: string; quantity: number; selected: boolean }>).map(
                (i) => ({ slug: i.slug, quantity: i.quantity, selected: i.selected }),
              ),
            );
          }
        }
      }
    },
    [isLoggedIn],
  );

  const removeItem = useCallback(
    async (slug: string) => {
      setItems((prev) => prev.filter((i) => i.slug !== slug));
      if (isLoggedIn) await api.removeCartItem(slug);
    },
    [isLoggedIn],
  );

  const setQuantity = useCallback(
    async (slug: string, qty: number) => {
      if (qty <= 0) {
        await removeItem(slug);
        return;
      }
      const clamped = Math.min(99, qty);
      setItems((prev) => {
        const existing = prev.find((i) => i.slug === slug);
        if (existing) {
          return prev.map((i) => (i.slug === slug ? { ...i, quantity: clamped } : i));
        }
        return [...prev, { slug, quantity: clamped, selected: true }];
      });
      if (isLoggedIn) {
        const r = await api.updateCartItem(slug, { quantity: clamped });
        if (!r.ok) {
          // Try to add instead — could have been a "not in cart yet" path
          await api.addToCart(slug, clamped);
        }
      }
    },
    [isLoggedIn, removeItem],
  );

  const toggleSelected = useCallback(
    async (slug: string) => {
      let nextSelected = false;
      setItems((prev) =>
        prev.map((i) => {
          if (i.slug !== slug) return i;
          nextSelected = !i.selected;
          return { ...i, selected: nextSelected };
        }),
      );
      if (isLoggedIn) {
        await api.updateCartItem(slug, { selected: nextSelected });
      }
    },
    [isLoggedIn],
  );

  const toggleSelectAll = useCallback(async () => {
    const everySelected = items.length > 0 && items.every((i) => i.selected);
    const next = !everySelected;
    setItems((prev) => prev.map((i) => ({ ...i, selected: next })));
    if (isLoggedIn) {
      await Promise.all(
        items.map((i) => api.updateCartItem(i.slug, { selected: next })),
      );
    }
  }, [items, isLoggedIn]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (isLoggedIn) await api.clearCart("all");
  }, [isLoggedIn]);

  const clearSelected = useCallback(async () => {
    setItems((prev) => prev.filter((i) => !i.selected));
    if (isLoggedIn) await api.clearCart("selected");
  }, [isLoggedIn]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    const uniqueCount = items.length;
    const selectedCount = items.filter((i) => i.selected).length;
    const allSelected = uniqueCount > 0 && selectedCount === uniqueCount;
    return {
      items,
      hydrated,
      getQuantity: (slug) => items.find((i) => i.slug === slug)?.quantity ?? 0,
      has: (slug) => items.some((i) => i.slug === slug),
      addItem,
      removeItem,
      setQuantity,
      toggleSelected,
      toggleSelectAll,
      clearCart,
      clearSelected,
      itemCount,
      uniqueCount,
      selectedCount,
      allSelected,
    };
  }, [
    items,
    hydrated,
    addItem,
    removeItem,
    setQuantity,
    toggleSelected,
    toggleSelectAll,
    clearCart,
    clearSelected,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart() must be used within <CartProvider>");
  }
  return ctx;
}
