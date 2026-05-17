import { forbidden, ok, unauthorized } from "@/lib/server/response";
import { requireAdmin } from "@/lib/server/auth";
import { listAllOrders } from "@/lib/server/admin-helpers";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** GET /api/admin/returns — list all return-pending orders */
export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const rows = listAllOrders()
    .filter((o) => o.returnStatus !== "none")
    .map((o) => {
      const u = store.findUserById(o.userId);
      return {
        ...o,
        customerName: u?.name ?? "—",
        customerEmail: u?.email ?? "—",
      };
    });
  return ok({ returns: rows });
}
