/**
 * Server-side data store — Prisma + Postgres.
 *
 * Same exported `store` API surface as the previous file-backed version,
 * but every method is now `async` and queries Postgres via Prisma. The
 * TypeScript shapes (`ServerUser`, `ServerAddress`, `ServerOrder`, ...)
 * are preserved exactly so route handlers and helpers don't change
 * signatures.
 *
 * One real behavioral change: methods that were sync are now async.
 * Every callsite must `await` them. The compiler enforces this.
 */

import "server-only";
import type { Address, CartItem, Coupon as CouponRow, Inventory, Order, Review, User } from "@prisma/client";
import { getAllBooks } from "../books";
import { DEFAULT_COUPONS, type Coupon } from "../coupons";
import { prisma } from "./prisma";

// ---------------------------------------------------------------------
// Re-exported shapes — kept identical to the JSON-store version so
// callers don't change. All `number` timestamps are ms-since-epoch
// (previously how JSON serialized; we convert at the boundary below).
// ---------------------------------------------------------------------

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

const INITIAL_UNITS = 25;

// ---------------------------------------------------------------------
// Row → DTO mappers. Prisma returns Date objects and `null` for
// optional fields; our DTOs use `number` for timestamps and undefined
// for optional fields. We adapt at the boundary so nothing leaks.
// ---------------------------------------------------------------------

function userRowToDto(u: User): ServerUser {
  return {
    id: u.id,
    email: u.email,
    passwordHash: u.passwordHash,
    name: u.name,
    phone: u.phone ?? undefined,
    emailVerified: u.emailVerified,
    emailVerifyCode: u.emailVerifyCode ?? undefined,
    resetCode: u.resetCode ?? undefined,
    createdAt: u.createdAt.getTime(),
  };
}

function addressRowToDto(a: Address): ServerAddress {
  return {
    id: a.id,
    userId: a.userId,
    label: a.label,
    recipientName: a.recipientName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    zip: a.zip ?? undefined,
    isDefault: a.isDefault,
  };
}

function cartRowToDto(c: CartItem): ServerCartItem {
  return {
    userId: c.userId,
    slug: c.slug,
    quantity: c.quantity,
    selected: c.selected,
    updatedAt: c.updatedAt.getTime(),
  };
}

function orderRowToDto(o: Order): ServerOrder {
  return {
    id: o.id,
    userId: o.userId,
    placedAt: o.placedAt.getTime(),
    status: o.status as ServerOrder["status"],
    items: o.items as ServerOrder["items"],
    address: o.address as ServerOrder["address"],
    payment: { method: o.paymentMethod, status: o.paymentStatus as ServerOrder["payment"]["status"] },
    subtotal: o.subtotal,
    vat: o.vat,
    shipping: o.shipping,
    total: o.total,
    couponCode: o.couponCode ?? undefined,
    returnStatus: o.returnStatus as ServerOrder["returnStatus"],
    cancelReason: o.cancelReason ?? undefined,
    returnReason: o.returnReason ?? undefined,
  };
}

function reviewRowToDto(r: Review): ServerReview {
  return {
    id: r.id,
    slug: r.slug,
    userId: r.userId,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt.getTime(),
    verifiedPurchase: r.verifiedPurchase,
  };
}

function couponRowToDto(c: CouponRow): Coupon {
  return {
    code: c.code,
    kind: c.kind as Coupon["kind"],
    value: c.value,
    minSubtotal: c.minSubtotal ?? undefined,
    maxDiscount: c.maxDiscount ?? undefined,
    description: c.description,
    successLabel: c.successLabel,
  };
}

// ---------------------------------------------------------------------
// Store API — all methods now async.
// ---------------------------------------------------------------------

export const store = {
  // ---- Users ----------------------------------------------------------
  async findUserByEmail(email: string): Promise<ServerUser | undefined> {
    const u = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    return u ? userRowToDto(u) : undefined;
  },
  async findUserById(id: string): Promise<ServerUser | undefined> {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? userRowToDto(u) : undefined;
  },
  async createUser(u: ServerUser): Promise<ServerUser> {
    const created = await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        phone: u.phone ?? null,
        emailVerified: u.emailVerified,
        emailVerifyCode: u.emailVerifyCode ?? null,
        resetCode: u.resetCode ?? null,
        createdAt: new Date(u.createdAt),
      },
    });
    return userRowToDto(created);
  },
  async updateUser(id: string, patch: Partial<ServerUser>): Promise<ServerUser | undefined> {
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          email: patch.email,
          passwordHash: patch.passwordHash,
          name: patch.name,
          phone: patch.phone === undefined ? undefined : (patch.phone ?? null),
          emailVerified: patch.emailVerified,
          emailVerifyCode:
            patch.emailVerifyCode === undefined ? undefined : (patch.emailVerifyCode ?? null),
          resetCode: patch.resetCode === undefined ? undefined : (patch.resetCode ?? null),
        },
      });
      return userRowToDto(updated);
    } catch {
      return undefined;
    }
  },

  // ---- Addresses ------------------------------------------------------
  async addressesFor(userId: string): Promise<ServerAddress[]> {
    const rows = await prisma.address.findMany({ where: { userId } });
    return rows.map(addressRowToDto);
  },
  async upsertAddress(a: ServerAddress): Promise<ServerAddress> {
    // If marking as default, clear other defaults for this user first.
    if (a.isDefault) {
      await prisma.address.updateMany({
        where: { userId: a.userId, isDefault: true, NOT: { id: a.id } },
        data: { isDefault: false },
      });
    }
    const saved = await prisma.address.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        userId: a.userId,
        label: a.label,
        recipientName: a.recipientName,
        phone: a.phone,
        line1: a.line1,
        line2: a.line2 ?? null,
        city: a.city,
        zip: a.zip ?? null,
        isDefault: a.isDefault,
      },
      update: {
        label: a.label,
        recipientName: a.recipientName,
        phone: a.phone,
        line1: a.line1,
        line2: a.line2 ?? null,
        city: a.city,
        zip: a.zip ?? null,
        isDefault: a.isDefault,
      },
    });
    return addressRowToDto(saved);
  },
  async deleteAddress(id: string): Promise<void> {
    await prisma.address.delete({ where: { id } }).catch(() => {});
  },

  // ---- Cart -----------------------------------------------------------
  async cartFor(userId: string): Promise<ServerCartItem[]> {
    const rows = await prisma.cartItem.findMany({ where: { userId } });
    return rows.map(cartRowToDto);
  },
  async upsertCart(item: ServerCartItem): Promise<ServerCartItem> {
    const saved = await prisma.cartItem.upsert({
      where: { userId_slug: { userId: item.userId, slug: item.slug } },
      create: {
        userId: item.userId,
        slug: item.slug,
        quantity: item.quantity,
        selected: item.selected,
      },
      update: {
        quantity: item.quantity,
        selected: item.selected,
      },
    });
    return cartRowToDto(saved);
  },
  async removeCart(userId: string, slug: string): Promise<void> {
    await prisma.cartItem
      .delete({ where: { userId_slug: { userId, slug } } })
      .catch(() => {});
  },
  async clearCart(userId: string, opts?: { onlySelected?: boolean }): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { userId, ...(opts?.onlySelected ? { selected: true } : {}) },
    });
  },

  // ---- Orders ---------------------------------------------------------
  async ordersFor(userId: string): Promise<ServerOrder[]> {
    const rows = await prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: "desc" },
    });
    return rows.map(orderRowToDto);
  },
  async getOrder(id: string): Promise<ServerOrder | undefined> {
    const row = await prisma.order.findUnique({ where: { id } });
    return row ? orderRowToDto(row) : undefined;
  },
  async createOrder(o: ServerOrder): Promise<ServerOrder> {
    const created = await prisma.order.create({
      data: {
        id: o.id,
        userId: o.userId,
        placedAt: new Date(o.placedAt),
        status: o.status,
        items: o.items as never,
        address: o.address as never,
        paymentMethod: o.payment.method,
        paymentStatus: o.payment.status,
        subtotal: o.subtotal,
        vat: o.vat,
        shipping: o.shipping,
        total: o.total,
        couponCode: o.couponCode ?? null,
        returnStatus: o.returnStatus,
        cancelReason: o.cancelReason ?? null,
        returnReason: o.returnReason ?? null,
      },
    });
    return orderRowToDto(created);
  },
  async updateOrder(id: string, patch: Partial<ServerOrder>): Promise<ServerOrder | undefined> {
    try {
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: patch.status,
          items: patch.items === undefined ? undefined : (patch.items as never),
          address: patch.address === undefined ? undefined : (patch.address as never),
          paymentMethod: patch.payment?.method,
          paymentStatus: patch.payment?.status,
          subtotal: patch.subtotal,
          vat: patch.vat,
          shipping: patch.shipping,
          total: patch.total,
          couponCode: patch.couponCode === undefined ? undefined : (patch.couponCode ?? null),
          returnStatus: patch.returnStatus,
          cancelReason: patch.cancelReason === undefined ? undefined : (patch.cancelReason ?? null),
          returnReason: patch.returnReason === undefined ? undefined : (patch.returnReason ?? null),
        },
      });
      return orderRowToDto(updated);
    } catch {
      return undefined;
    }
  },

  // ---- Reviews --------------------------------------------------------
  async reviewsFor(slug: string): Promise<ServerReview[]> {
    const rows = await prisma.review.findMany({
      where: { slug },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(reviewRowToDto);
  },
  async hasReviewed(userId: string, slug: string): Promise<boolean> {
    const r = await prisma.review.findUnique({
      where: { slug_userId: { slug, userId } },
    });
    return !!r;
  },
  async createReview(r: ServerReview): Promise<ServerReview> {
    const created = await prisma.review.create({
      data: {
        id: r.id,
        slug: r.slug,
        userId: r.userId,
        authorName: r.authorName,
        rating: r.rating,
        title: r.title,
        body: r.body,
        createdAt: new Date(r.createdAt),
        verifiedPurchase: r.verifiedPurchase,
      },
    });
    return reviewRowToDto(created);
  },

  // ---- Admin helpers (full table dumps) -------------------------------
  async dumpAllOrders(): Promise<ServerOrder[]> {
    const rows = await prisma.order.findMany({ orderBy: { placedAt: "desc" } });
    return rows.map(orderRowToDto);
  },
  async dumpAllUsers(): Promise<ServerUser[]> {
    const rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(userRowToDto);
  },
  async dumpAllReviews(): Promise<ServerReview[]> {
    const rows = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(reviewRowToDto);
  },

  // ---- Coupons --------------------------------------------------------
  async dumpCoupons(): Promise<Coupon[]> {
    let rows = await prisma.coupon.findMany();
    if (rows.length === 0) {
      // First boot — seed defaults.
      await prisma.coupon.createMany({
        data: DEFAULT_COUPONS.map((c) => ({
          code: c.code,
          kind: c.kind,
          value: c.value,
          minSubtotal: c.minSubtotal ?? null,
          maxDiscount: c.maxDiscount ?? null,
          description: c.description,
          successLabel: c.successLabel,
        })),
        skipDuplicates: true,
      });
      rows = await prisma.coupon.findMany();
    }
    return rows.map(couponRowToDto);
  },
  async upsertCoupon(coupon: Coupon): Promise<Coupon> {
    const saved = await prisma.coupon.upsert({
      where: { code: coupon.code },
      create: {
        code: coupon.code,
        kind: coupon.kind,
        value: coupon.value,
        minSubtotal: coupon.minSubtotal ?? null,
        maxDiscount: coupon.maxDiscount ?? null,
        description: coupon.description,
        successLabel: coupon.successLabel,
      },
      update: {
        kind: coupon.kind,
        value: coupon.value,
        minSubtotal: coupon.minSubtotal ?? null,
        maxDiscount: coupon.maxDiscount ?? null,
        description: coupon.description,
        successLabel: coupon.successLabel,
      },
    });
    return couponRowToDto(saved);
  },
  async deleteCoupon(code: string): Promise<boolean> {
    try {
      await prisma.coupon.delete({ where: { code } });
      return true;
    } catch {
      return false;
    }
  },

  // ---- Inventory ------------------------------------------------------
  async getInventory(slug: string): Promise<number> {
    const row = await prisma.inventory.findUnique({ where: { slug } });
    return row?.units ?? 0;
  },
  async setInventory(slug: string, units: number): Promise<number> {
    const u = Math.max(0, Math.floor(units));
    const saved = await prisma.inventory.upsert({
      where: { slug },
      create: { slug, units: u },
      update: { units: u },
    });
    return saved.units;
  },
  async decrementInventory(
    items: Array<{ slug: string; quantity: number }>,
  ): Promise<{ ok: true } | { ok: false; lacking: string[] }> {
    const books = getAllBooks();
    // Read current inventory for everything we want to decrement.
    const slugs = items.map((i) => i.slug);
    const current = await prisma.inventory.findMany({
      where: { slug: { in: slugs } },
    });
    const map = new Map(current.map((r) => [r.slug, r.units]));
    const lacking: string[] = [];
    for (const it of items) {
      const b = books.find((x) => x.slug === it.slug);
      if (!b || b.stock === "preorder") continue;
      if ((map.get(it.slug) ?? 0) < it.quantity) lacking.push(it.slug);
    }
    if (lacking.length > 0) return { ok: false, lacking };

    // Atomic decrement per row.
    await prisma.$transaction(
      items
        .filter((it) => {
          const b = books.find((x) => x.slug === it.slug);
          return b && b.stock !== "preorder";
        })
        .map((it) =>
          prisma.inventory.update({
            where: { slug: it.slug },
            data: { units: { decrement: it.quantity } },
          }),
        ),
    );
    return { ok: true };
  },
  async incrementInventory(items: Array<{ slug: string; quantity: number }>): Promise<void> {
    const books = getAllBooks();
    const ops = items
      .filter((it) => {
        const b = books.find((x) => x.slug === it.slug);
        return b && b.stock !== "preorder";
      })
      .map((it) =>
        prisma.inventory.upsert({
          where: { slug: it.slug },
          create: { slug: it.slug, units: it.quantity + INITIAL_UNITS },
          update: { units: { increment: it.quantity } },
        }),
      );
    if (ops.length > 0) await prisma.$transaction(ops);
  },
};
