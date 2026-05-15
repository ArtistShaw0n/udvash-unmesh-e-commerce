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

const STORAGE_KEY = "udvash:cart-v1";

export interface CartItem {
  slug: string;
  quantity: number;
  selected: boolean;
}

export interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  /** Quantity of a specific item in cart (0 if not present). */
  getQuantity: (slug: string) => number;
  /** Returns true if the slug is in the cart. */
  has: (slug: string) => boolean;
  /** Add to cart. If item exists, increment by qty. */
  addItem: (slug: string, qty?: number) => void;
  /** Remove the item entirely. */
  removeItem: (slug: string) => void;
  /** Set absolute quantity. If qty <= 0, removes the item. */
  setQuantity: (slug: string, qty: number) => void;
  /** Toggle the selected state for checkout. */
  toggleSelected: (slug: string) => void;
  /** Select / unselect all items at once. */
  toggleSelectAll: () => void;
  /** Empty the cart. */
  clearCart: () => void;
  /** Remove just the selected items (after a successful checkout). */
  clearSelected: () => void;
  /** Sum of all quantities (for the header badge). */
  itemCount: number;
  /** Number of unique books in the cart. */
  uniqueCount: number;
  /** Number of *selected* unique books. */
  selectedCount: number;
  /** True when every item is selected. */
  allSelected: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function readFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is CartItem =>
          x && typeof x === "object" &&
          typeof x.slug === "string" &&
          typeof x.quantity === "number" &&
          typeof x.selected === "boolean",
      )
      .map((x) => ({ ...x, quantity: Math.max(1, Math.floor(x.quantity)) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  // Avoid writing to storage on the very first commit (before hydration).
  const writeRef = useRef(false);

  // Load from storage on first client render.
  useEffect(() => {
    setItems(readFromStorage());
    setHydrated(true);
  }, []);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    if (!writeRef.current) {
      writeRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or disabled — ignore */
    }
  }, [items, hydrated]);

  // Cross-tab sync.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      setItems(readFromStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback((slug: string, qty: number = 1) => {
    if (qty <= 0) return;
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
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const setQuantity = useCallback((slug: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.slug !== slug);
      const existing = prev.find((i) => i.slug === slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === slug ? { ...i, quantity: Math.min(99, qty) } : i,
        );
      }
      // Allow setting qty for a slug that wasn't there yet (counter button on a card).
      return [...prev, { slug, quantity: Math.min(99, qty), selected: true }];
    });
  }, []);

  const toggleSelected = useCallback((slug: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.slug === slug ? { ...i, selected: !i.selected } : i,
      ),
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setItems((prev) => {
      const everySelected = prev.length > 0 && prev.every((i) => i.selected);
      return prev.map((i) => ({ ...i, selected: !everySelected }));
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const clearSelected = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.selected));
  }, []);

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
