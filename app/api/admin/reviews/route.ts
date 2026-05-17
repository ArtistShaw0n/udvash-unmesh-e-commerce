import { forbidden, ok, unauthorized } from "@/lib/server/response";
import { requireAdmin } from "@/lib/server/auth";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** GET /api/admin/reviews — list all reviews with author + book info */
export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const reviews = (await store.dumpAllReviews()).sort((a, b) => b.createdAt - a.createdAt);
  return ok({ reviews });
}
