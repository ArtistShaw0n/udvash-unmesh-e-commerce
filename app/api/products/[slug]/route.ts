import { NextRequest } from "next/server";
import { notFound, ok } from "@/lib/server/response";
import { getBookBySlug, getRelatedBooks } from "@/lib/books";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) return notFound("Product not found");

  const reviews = store.reviewsFor(slug);
  const ratingCount = reviews.length;
  const ratingAverage =
    ratingCount > 0
      ? Number((reviews.reduce((s, r) => s + r.rating, 0) / ratingCount).toFixed(1))
      : 0;

  return ok({
    book: {
      ...book,
      inventoryUnits: store.getInventory(slug),
      ratingCount,
      ratingAverage,
    },
    related: getRelatedBooks(book, 4),
  });
}
