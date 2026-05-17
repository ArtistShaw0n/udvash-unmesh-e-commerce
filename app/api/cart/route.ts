import { NextRequest } from "next/server";
import { badRequest, ok, unauthorized } from "@/lib/server/response";
import { getCurrentUser } from "@/lib/server/auth";
import { store } from "@/lib/server/store";
import { getBookBySlug } from "@/lib/books";

export const dynamic = "force-dynamic";

/** GET /api/cart — return all cart entries with resolved book data */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const entries = store.cartFor(user.id);
  const resolved = entries
    .map((e) => {
      const book = getBookBySlug(e.slug);
      return book ? { ...e, book } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  return ok({ items: resolved });
}

/** POST /api/cart — add or merge a cart item */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const slug = body?.slug as string | undefined;
  const quantity = Number(body?.quantity ?? 1);

  if (!slug || quantity <= 0) return badRequest("slug + positive quantity required");
  if (!getBookBySlug(slug)) return badRequest("Unknown product");

  const existing = store.cartFor(user.id).find((c) => c.slug === slug);
  const newQty = Math.min(99, (existing?.quantity ?? 0) + quantity);
  store.upsertCart({
    userId: user.id,
    slug,
    quantity: newQty,
    selected: existing?.selected ?? true,
    updatedAt: Date.now(),
  });

  return ok({ item: { slug, quantity: newQty, selected: existing?.selected ?? true } });
}

/** PATCH /api/cart — update quantity or selected flag */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const slug = body?.slug as string | undefined;
  if (!slug) return badRequest("slug required");

  const existing = store.cartFor(user.id).find((c) => c.slug === slug);
  if (!existing) return badRequest("Item not in cart");

  const quantity =
    typeof body.quantity === "number"
      ? Math.max(0, Math.min(99, body.quantity))
      : existing.quantity;

  if (quantity === 0) {
    store.removeCart(user.id, slug);
    return ok({ removed: true });
  }

  store.upsertCart({
    ...existing,
    quantity,
    selected: typeof body.selected === "boolean" ? body.selected : existing.selected,
    updatedAt: Date.now(),
  });
  return ok({ item: { slug, quantity, selected: existing.selected } });
}

/** DELETE /api/cart?slug=... OR /api/cart?clear=selected|all */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const clear = searchParams.get("clear");

  if (slug) {
    store.removeCart(user.id, slug);
    return ok({ removed: true });
  }
  if (clear === "selected") {
    store.clearCart(user.id, { onlySelected: true });
    return ok({ cleared: "selected" });
  }
  if (clear === "all") {
    store.clearCart(user.id);
    return ok({ cleared: "all" });
  }
  return badRequest("Specify ?slug= or ?clear=selected|all");
}
