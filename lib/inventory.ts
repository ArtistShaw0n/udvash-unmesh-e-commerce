/**
 * Inventory adjustment layer.
 *
 * `books.json` is the static catalog with a `stock` enum field. Real
 * inventory tracks a *number* of units left — which we overlay via
 * localStorage adjustments. The catalog is the floor; this overlay
 * tracks decrements (from orders) and restocks.
 *
 * Initial seed: every in-stock SKU starts with INITIAL_UNITS units.
 * Preorder SKUs are tracked separately (no decrement, only count).
 * Out-of-stock SKUs are forced to 0.
 */

import { getAllBooks, type Book } from "./books";

const STORAGE_KEY = "udvash:inventory-v1";
const INITIAL_UNITS = 25; // demo starting stock for in-stock items

export type StockStatus = "in-stock" | "low-stock" | "preorder" | "out-of-stock";

export interface StockSnapshot {
  slug: string;
  units: number;
  status: StockStatus;
}

interface InventoryMap {
  [slug: string]: number; // units remaining
}

function seedFor(slug: string): number {
  const b = getAllBooks().find((x) => x.slug === slug);
  if (!b) return 0;
  if (b.stock === "out-of-stock") return 0;
  if (b.stock === "preorder") return 0; // preorder doesn't deplete
  return INITIAL_UNITS;
}

function readMap(): InventoryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init: InventoryMap = {};
      for (const b of getAllBooks()) init[b.slug] = seedFor(b.slug);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: InventoryMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function statusFor(book: Book, units: number): StockStatus {
  if (book.stock === "preorder") return "preorder";
  if (units <= 0) return "out-of-stock";
  if (units <= 5) return "low-stock";
  return "in-stock";
}

/**
 * Look up current units + effective status for a slug.
 */
export function getStock(slug: string): StockSnapshot {
  const book = getAllBooks().find((b) => b.slug === slug);
  if (!book) return { slug, units: 0, status: "out-of-stock" };
  const map = readMap();
  const units = map[slug] ?? seedFor(slug);
  return { slug, units, status: statusFor(book, units) };
}

/**
 * Snapshot of current stock for many slugs at once.
 */
export function getStockMany(slugs: string[]): Record<string, StockSnapshot> {
  const map = readMap();
  const out: Record<string, StockSnapshot> = {};
  for (const slug of slugs) {
    const book = getAllBooks().find((b) => b.slug === slug);
    if (!book) {
      out[slug] = { slug, units: 0, status: "out-of-stock" };
      continue;
    }
    const units = map[slug] ?? seedFor(slug);
    out[slug] = { slug, units, status: statusFor(book, units) };
  }
  return out;
}

/**
 * Decrement units for each line item. Returns the new snapshot OR an
 * error result if any line would go below zero. Atomic — either all
 * decrements succeed or none are applied.
 */
export interface DecrementInput {
  slug: string;
  quantity: number;
}

export function decrementStock(
  items: DecrementInput[],
): { ok: true; updated: StockSnapshot[] } | { ok: false; error: string; lacking: string[] } {
  const map = readMap();
  const books = getAllBooks();
  const lacking: string[] = [];

  // Validate
  for (const it of items) {
    const b = books.find((x) => x.slug === it.slug);
    if (!b) {
      lacking.push(it.slug);
      continue;
    }
    if (b.stock === "preorder") continue; // preorders don't deplete
    const current = map[it.slug] ?? seedFor(it.slug);
    if (current < it.quantity) lacking.push(it.slug);
  }
  if (lacking.length > 0) {
    return {
      ok: false,
      error: `নিম্নলিখিত বইয়ের পর্যাপ্ত স্টক নেই: ${lacking.join(", ")}`,
      lacking,
    };
  }

  // Apply
  for (const it of items) {
    const b = books.find((x) => x.slug === it.slug);
    if (!b || b.stock === "preorder") continue;
    const current = map[it.slug] ?? seedFor(it.slug);
    map[it.slug] = Math.max(0, current - it.quantity);
  }
  writeMap(map);

  return {
    ok: true,
    updated: items.map((it) => {
      const b = books.find((x) => x.slug === it.slug);
      const units = map[it.slug] ?? 0;
      return {
        slug: it.slug,
        units,
        status: b ? statusFor(b, units) : "out-of-stock",
      };
    }),
  };
}

/**
 * Add stock back (e.g. cancel order, return processed).
 */
export function incrementStock(items: DecrementInput[]): StockSnapshot[] {
  const map = readMap();
  const books = getAllBooks();
  const updated: StockSnapshot[] = [];
  for (const it of items) {
    const b = books.find((x) => x.slug === it.slug);
    if (!b || b.stock === "preorder") continue;
    const current = map[it.slug] ?? seedFor(it.slug);
    map[it.slug] = current + it.quantity;
    updated.push({
      slug: it.slug,
      units: map[it.slug],
      status: statusFor(b, map[it.slug]),
    });
  }
  writeMap(map);
  return updated;
}

/**
 * Reset inventory to seed values (dev/test helper).
 */
export function resetInventory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
