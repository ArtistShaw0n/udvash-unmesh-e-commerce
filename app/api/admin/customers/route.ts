import { NextRequest } from "next/server";
import { forbidden, ok, unauthorized } from "@/lib/server/response";
import { requireAdmin } from "@/lib/server/auth";
import { listAllCustomers } from "@/lib/server/admin-helpers";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** GET /api/admin/customers?q=... — list (with order counts + revenue) */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase();

  let list = await listAllCustomers();
  if (q) {
    list = list.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q),
    );
  }

  const rows = await Promise.all(
    list.slice(0, 200).map(async (u) => {
      const orders = await store.ordersFor(u.id);
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        orderCount: orders.length,
        revenue: orders
          .filter((o) => o.status !== "cancelled")
          .reduce((s, o) => s + o.total, 0),
      };
    }),
  );

  return ok({ customers: rows, total: list.length });
}
