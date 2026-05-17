import { NextRequest } from "next/server";
import { badRequest, forbidden, ok, unauthorized } from "@/lib/server/response";
import { requireAdmin } from "@/lib/server/auth";
import { getAllBooks } from "@/lib/books";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** GET /api/admin/inventory — list every SKU with its current units */
export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const rows = await Promise.all(
    getAllBooks().map(async (b) => ({
      slug: b.slug,
      title: b.title,
      titleBn: b.titleBn,
      category: b.categoryLabel,
      catalogStock: b.stock,
      units: await store.getInventory(b.slug),
    })),
  );
  return ok({ inventory: rows });
}

/** PATCH /api/admin/inventory — body: { slug, units } */
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const body = await req.json().catch(() => null);
  if (!body?.slug || typeof body.units !== "number") {
    return badRequest("slug + numeric units required");
  }
  const next = await store.setInventory(body.slug, body.units);
  return ok({ slug: body.slug, units: next });
}
