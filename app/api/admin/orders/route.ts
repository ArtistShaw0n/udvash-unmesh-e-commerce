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

  let list = listAllOrders();
  if (status) list = list.filter((o) => o.status === status);
  if (q) {
    list = list.filter((o) => {
      const u = store.findUserById(o.userId);
      return (
        o.id.toLowerCase().includes(q) ||
        (u?.email?.toLowerCase().includes(q) ?? false) ||
        o.address.recipientName.toLowerCase().includes(q) ||
        o.address.phone.toLowerCase().includes(q)
      );
    });
  }

  // Attach customer email/name for the list view
  const rows = list.slice(0, 200).map((o) => {
    const u = store.findUserById(o.userId);
    return {
      ...o,
      customerName: u?.name ?? "—",
      customerEmail: u?.email ?? "—",
    };
  });

  return ok({ orders: rows, total: list.length });
}
