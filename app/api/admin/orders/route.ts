import { NextRequest } from "next/server";
import { forbidden, ok, unauthorized } from "@/lib/server/response";
import { requireAdmin } from "@/lib/server/auth";
import { listAllOrders } from "@/lib/server/admin-helpers";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** GET /api/admin/orders?status=...&q=...  */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.toLowerCase();

  let list = await listAllOrders();
  if (status) list = list.filter((o) => o.status === status);
  if (q) {
    // Resolve users in parallel for the filter step
    const filtered: typeof list = [];
    for (const o of list) {
      const u = await store.findUserById(o.userId);
      if (
        o.id.toLowerCase().includes(q) ||
        (u?.email?.toLowerCase().includes(q) ?? false) ||
        o.address.recipientName.toLowerCase().includes(q) ||
        o.address.phone.toLowerCase().includes(q)
      ) {
        filtered.push(o);
      }
    }
    list = filtered;
  }

  // Attach customer email/name for the list view
  const rows = await Promise.all(
    list.slice(0, 200).map(async (o) => {
      const u = await store.findUserById(o.userId);
      return {
        ...o,
        customerName: u?.name ?? "—",
        customerEmail: u?.email ?? "—",
      };
    }),
  );

  return ok({ orders: rows, total: list.length });
}
