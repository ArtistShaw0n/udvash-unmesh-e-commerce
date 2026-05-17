import { NextRequest } from "next/server";
import { ok } from "@/lib/server/response";
import { getAllBooks, getBooksByCategory } from "@/lib/books";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/**
 * GET /api/products?category=slug&q=query
 * Returns products with live inventory snapshots merged in.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "all";
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  let books = category === "all" ? getAllBooks() : getBooksByCategory(category);
  if (q) {
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.titleBn.includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.descriptionBn.includes(q) ||
        b.author.toLowerCase().includes(q),
    );
  }

  const products = books.map((b) => ({
    ...b,
    inventoryUnits: store.getInventory(b.slug),
  }));

  return ok({ products, total: products.length });
}
