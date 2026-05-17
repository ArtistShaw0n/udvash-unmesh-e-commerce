/**
 * Server-side admin helpers — wrap the store with admin-only operations
 * and aggregate queries (dashboard KPIs, paginated lists, etc.).
 */

import "server-only";
import { store, type ServerOrder, type ServerUser } from "./store";
import { getAllBooks } from "../books";

// ------------------------------------------------------------------
// Dashboard stats
// ------------------------------------------------------------------

export interface DashboardStats {
  ordersTotal: number;
  ordersToday: number;
  revenueAll: number;
  revenueToday: number;
  customersTotal: number;
  customersThisWeek: number;
  pendingReturns: number;
  lowStockCount: number;
  byStatus: Record<ServerOrder["status"], number>;
}

function startOfDay(d: Date = new Date()): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function daysAgo(n: number): number {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getDashboardStats(): DashboardStats {
  // Pull lists by scanning all users / orders. Fine for the file-backed
  // store; with Prisma+Postgres these become aggregate SQL queries.
  const allUsers: ServerUser[] = [];
  // Walk users by sampling via "ordersFor" — we don't have a list-all,
  // but we can read from the internal `.data` map indirectly. For demo
  // we approximate by deduping orders.email
  // Pragmatic shim: peek at the store's private map.
  // (When migrating to Prisma, replace with `prisma.user.count()` etc.)
  const orderList = listAllOrders();
  const uniqueEmails = new Set(orderList.map((o) => o.userId));
  for (const id of uniqueEmails) {
    const u = store.findUserById(id);
    if (u) allUsers.push(u);
  }

  const todayCutoff = startOfDay();
  const weekCutoff = daysAgo(7);

  const ordersToday = orderList.filter((o) => o.placedAt >= todayCutoff);
  const customersThisWeek = allUsers.filter((u) => u.createdAt >= weekCutoff);

  const byStatus: DashboardStats["byStatus"] = {
    placed: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  let revenueAll = 0;
  let revenueToday = 0;
  let pendingReturns = 0;
  for (const o of orderList) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    if (o.status !== "cancelled") revenueAll += o.total;
    if (o.placedAt >= todayCutoff && o.status !== "cancelled") revenueToday += o.total;
    if (o.returnStatus !== "none" && o.returnStatus !== "refunded" && o.returnStatus !== "rejected") {
      pendingReturns += 1;
    }
  }

  // Low stock: any in-stock SKU with <= 5 units
  let lowStockCount = 0;
  for (const b of getAllBooks()) {
    if (b.stock === "out-of-stock" || b.stock === "preorder") continue;
    const units = store.getInventory(b.slug);
    if (units <= 5) lowStockCount += 1;
  }

  return {
    ordersTotal: orderList.length,
    ordersToday: ordersToday.length,
    revenueAll,
    revenueToday,
    customersTotal: allUsers.length,
    customersThisWeek: customersThisWeek.length,
    pendingReturns,
    lowStockCount,
    byStatus,
  };
}

// ------------------------------------------------------------------
// List helpers — scan the store
// ------------------------------------------------------------------

export function listAllOrders(): ServerOrder[] {
  // No public list-all method on store; reach in via ordersFor(undefined)
  // is unsupported — instead we rebuild from each user we've seen.
  // For the file-backed store we just iterate every order id by scanning.
  // (When migrating: `prisma.order.findMany({ orderBy: { placedAt: 'desc' }})`)
  const out: ServerOrder[] = [];
  // The store doesn't expose its internals; expose via a helper there
  // → see store.ts where we expose `listOrders` for admin use only.
  for (const o of getAllOrdersFromStore()) out.push(o);
  return out.sort((a, b) => b.placedAt - a.placedAt);
}

function getAllOrdersFromStore(): ServerOrder[] {
  // Recreate behaviour: iterate by reading the store's internal map.
  // The store exposes ordersFor(userId); we use a private trick — read
  // the data file directly through the load() side effect by trying a
  // sentinel. Simpler: add a "_dumpAllOrders" to store. Done below.
  return store.dumpAllOrders();
}

export function listAllCustomers(): ServerUser[] {
  return store.dumpAllUsers();
}
