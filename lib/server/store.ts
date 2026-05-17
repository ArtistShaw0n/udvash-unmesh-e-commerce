/**
 * Server-side data store.
 *
 * In dev: in-memory + JSON file at .data/store.json (writes-through).
 * In prod: swap this entire file for a Prisma + Postgres implementation
 * matching the same exported API surface. See BACKEND.md for the migration
 * playbook.
 *
 * SHAPE — table per domain. Operations are synchronous against the
 * in-memory map; persistence happens in a debounced write.
 */

import "server-only";
import fs from "node:fs";
import path from "node:path";
import { getAllBooks } from "../books";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

export interface ServerUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  emailVerified: boolean;
  emailVerifyCode?: string;
  resetCode?: string;
  createdAt: number;
}

export interface ServerAddress {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  zip?: string;
  isDefault: boolean;
}

export interface ServerCartItem {
  userId: string;
  slug: string;
  quantity: number;
  selected: boolean;
  updatedAt: number;
}

export interface ServerWishlistItem {
  userId: string;
  slug: string;
  addedAt: number;
}

export interface ServerOrder {
  id: string;
  userId: string;
  placedAt: number;
  status: "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: Array<{ slug: string; quantity: number; price: number; titleBn: string }>;
  address: Omit<ServerAddress, "id" | "userId" | "isDefault">;
  payment: { method: string; status: "paid" | "pending" | "cod" };
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  couponCode?: string;
  returnStatus: "none" | "requested" | "approved" | "picked-up" | "refunded" | "rejected";
  cancelReason?: string;
  returnReason?: string;
}

export interface ServerReview {
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

export interface ServerInventory {
  [slug: string]: number;
}

interface DbShape {
  users: Record<string, ServerUser>;
  addresses: Record<string, ServerAddress>;
  cart: ServerCartItem[];
  wishlist: ServerWishlistItem[];
  orders: Record<string, ServerOrder>;
  reviews: Record<string, ServerReview>;
  inventory: ServerInventory;
}

const INITIAL_UNITS = 25;

function emptyDb(): DbShape {
  const inventory: ServerInventory = {};
  for (const b of getAllBooks()) {
    inventory[b.slug] =
      b.stock === "out-of-stock" ? 0 : b.stock === "preorder" ? 0 : INITIAL_UNITS;
  }
  return {
    users: {},
    addresses: {},
    cart: [],
    wishlist: [],
    orders: {},
    reviews: {},
    inventory,
  };
}

let DB: DbShape | null = null;
let writeTimer: NodeJS.Timeout | null = null;

function load(): DbShape {
  if (DB) return DB;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      DB = JSON.parse(raw);
      return DB!;
    }
  } catch (err) {
    console.warn("[store] failed to read store.json:", err);
  }
  DB = emptyDb();
  return DB;
}

function persist() {
  if (!DB) return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(DB, null, 2));
    } catch (err) {
      // In serverless/read-only environments (e.g. Netlify lambda) this fails —
      // that's fine, data lives in memory until cold-start.
      if ((err as NodeJS.ErrnoException).code !== "EROFS") {
        console.warn("[store] persist failed:", err);
      }
    }
  }, 100);
}

export const store = {
  // ---- Users ----------------------------------------------------------
  findUserByEmail(email: string): ServerUser | undefined {
    const db = load();
    return Object.values(db.users).find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
  },
  findUserById(id: string): ServerUser | undefined {
    return load().users[id];
  },
  createUser(u: ServerUser): ServerUser {
    const db = load();
    db.users[u.id] = u;
    persist();
    return u;
  },
  updateUser(id: string, patch: Partial<ServerUser>): ServerUser | undefined {
    const db = load();
    const existing = db.users[id];
    if (!existing) return undefined;
    db.users[id] = { ...existing, ...patch };
    persist();
    return db.users[id];
  },

  // ---- Addresses ------------------------------------------------------
  addressesFor(userId: string): ServerAddress[] {
    const db = load();
    return Object.values(db.addresses).filter((a) => a.userId === userId);
  },
  upsertAddress(a: ServerAddress): ServerAddress {
    const db = load();
    if (a.isDefault) {
      for (const existing of Object.values(db.addresses)) {
        if (existing.userId === a.userId) existing.isDefault = false;
      }
    }
    db.addresses[a.id] = a;
    persist();
    return a;
  },
  deleteAddress(id: string): void {
    const db = load();
    delete db.addresses[id];
    persist();
  },

  // ---- Cart -----------------------------------------------------------
  cartFor(userId: string): ServerCartItem[] {
    return load().cart.filter((c) => c.userId === userId);
  },
  upsertCart(item: ServerCartItem): ServerCartItem {
    const db = load();
    const idx = db.cart.findIndex(
      (c) => c.userId === item.userId && c.slug === item.slug,
    );
    if (idx >= 0) db.cart[idx] = item;
    else db.cart.push(item);
    persist();
    return item;
  },
  removeCart(userId: string, slug: string): void {
    const db = load();
    db.cart = db.cart.filter((c) => !(c.userId === userId && c.slug === slug));
    persist();
  },
  clearCart(userId: string, opts?: { onlySelected?: boolean }): void {
    const db = load();
    db.cart = db.cart.filter((c) => {
      if (c.userId !== userId) return true;
      if (opts?.onlySelected) return !c.selected;
      return false;
    });
    persist();
  },

  // ---- Wishlist -------------------------------------------------------
  wishlistFor(userId: string): ServerWishlistItem[] {
    return load().wishlist.filter((w) => w.userId === userId);
  },
  toggleWishlist(userId: string, slug: string): { added: boolean } {
    const db = load();
    const idx = db.wishlist.findIndex((w) => w.userId === userId && w.slug === slug);
    if (idx >= 0) {
      db.wishlist.splice(idx, 1);
      persist();
      return { added: false };
    }
    db.wishlist.push({ userId, slug, addedAt: Date.now() });
    persist();
    return { added: true };
  },

  // ---- Orders ---------------------------------------------------------
  ordersFor(userId: string): ServerOrder[] {
    return Object.values(load().orders)
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.placedAt - a.placedAt);
  },
  getOrder(id: string): ServerOrder | undefined {
    return load().orders[id];
  },
  createOrder(o: ServerOrder): ServerOrder {
    const db = load();
    db.orders[o.id] = o;
    persist();
    return o;
  },
  updateOrder(id: string, patch: Partial<ServerOrder>): ServerOrder | undefined {
    const db = load();
    const existing = db.orders[id];
    if (!existing) return undefined;
    db.orders[id] = { ...existing, ...patch };
    persist();
    return db.orders[id];
  },

  // ---- Reviews --------------------------------------------------------
  reviewsFor(slug: string): ServerReview[] {
    return Object.values(load().reviews)
      .filter((r) => r.slug === slug)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
  hasReviewed(userId: string, slug: string): boolean {
    return Object.values(load().reviews).some(
      (r) => r.userId === userId && r.slug === slug,
    );
  },
  createReview(r: ServerReview): ServerReview {
    const db = load();
    db.reviews[r.id] = r;
    persist();
    return r;
  },

  // ---- Admin helpers (full table dumps) -------------------------------
  // These are deliberately separate from the per-user helpers above so
  // the admin route handlers can paginate / filter without leaking user
  // scoping into customer-facing code. When migrating to Prisma each of
  // these becomes `prisma.<table>.findMany()`.
  dumpAllOrders(): ServerOrder[] {
    return Object.values(load().orders);
  },
  dumpAllUsers(): ServerUser[] {
    return Object.values(load().users);
  },
  dumpAllReviews(): ServerReview[] {
    return Object.values(load().reviews);
  },
  setInventory(slug: string, units: number): number {
    const db = load();
    db.inventory[slug] = Math.max(0, Math.floor(units));
    persist();
    return db.inventory[slug];
  },

  // ---- Inventory ------------------------------------------------------
  getInventory(slug: string): number {
    const db = load();
    return db.inventory[slug] ?? 0;
  },
  decrementInventory(
    items: Array<{ slug: string; quantity: number }>,
  ): { ok: true } | { ok: false; lacking: string[] } {
    const db = load();
    const books = getAllBooks();
    const lacking: string[] = [];
    for (const it of items) {
      const b = books.find((x) => x.slug === it.slug);
      if (!b || b.stock === "preorder") continue;
      if ((db.inventory[it.slug] ?? 0) < it.quantity) lacking.push(it.slug);
    }
    if (lacking.length > 0) return { ok: false, lacking };
    for (const it of items) {
      const b = books.find((x) => x.slug === it.slug);
      if (!b || b.stock === "preorder") continue;
      db.inventory[it.slug] = Math.max(0, (db.inventory[it.slug] ?? 0) - it.quantity);
    }
    persist();
    return { ok: true };
  },
  incrementInventory(items: Array<{ slug: string; quantity: number }>): void {
    const db = load();
    const books = getAllBooks();
    for (const it of items) {
      const b = books.find((x) => x.slug === it.slug);
      if (!b || b.stock === "preorder") continue;
      db.inventory[it.slug] = (db.inventory[it.slug] ?? 0) + it.quantity;
    }
    persist();
  },
};
