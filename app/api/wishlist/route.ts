import { NextRequest } from "next/server";
import { badRequest, ok, unauthorized } from "@/lib/server/response";
import { getCurrentUser } from "@/lib/server/auth";
import { store } from "@/lib/server/store";
import { getBookBySlug } from "@/lib/books";

export const dynamic = "force-dynamic";

/** GET /api/wishlist — list current user's wishlist */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const items = store.wishlistFor(user.id);
  return ok({ slugs: items.map((w) => w.slug) });
}

/** POST /api/wishlist — toggle a slug. Body: { slug } */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const body = await req.json().catch(() => null);
  const slug = body?.slug as string | undefined;
  if (!slug) return badRequest("slug required");
  if (!getBookBySlug(slug)) return badRequest("Unknown product");
  const result = store.toggleWishlist(user.id, slug);
  return ok(result);
}
