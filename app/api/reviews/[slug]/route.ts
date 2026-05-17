import { NextRequest } from "next/server";
import { badRequest, conflict, ok, unauthorized } from "@/lib/server/response";
import { getCurrentUser } from "@/lib/server/auth";
import { store } from "@/lib/server/store";
import { getBookBySlug } from "@/lib/books";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ slug: string }>;
}

/** GET /api/reviews/[slug] — list reviews + aggregate summary */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { slug } = await params;
  const reviews = await store.reviewsFor(slug);
  const count = reviews.length;
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    const k = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[k] += 1;
    sum += r.rating;
  }
  const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;
  return ok({ reviews, summary: { count, average, distribution } });
}

/** POST /api/reviews/[slug] — add a review (must have purchased the book) */
export async function POST(req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { slug } = await params;

  if (!getBookBySlug(slug)) return badRequest("Unknown product");

  // Already reviewed?
  if (await store.hasReviewed(user.id, slug)) {
    return conflict("আপনি ইতিমধ্যে এই বইয়ের জন্য রিভিউ দিয়েছেন");
  }

  // Verified-purchase check
  const verifiedPurchase = (await store.ordersFor(user.id)).some((o) =>
    o.items.some((it) => it.slug === slug),
  );
  if (!verifiedPurchase) {
    return badRequest("রিভিউ লিখতে এই বইটি আপনার অর্ডারে থাকতে হবে");
  }

  const body = await req.json().catch(() => null);
  const rating = Number(body?.rating);
  const title = (body?.title as string | undefined)?.trim() || "—";
  const reviewBody = (body?.body as string | undefined)?.trim() || "";

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return badRequest("Rating 1-5 দিন");
  }
  if (!reviewBody) return badRequest("মন্তব্য লিখুন");

  const id = `rv_${Math.random().toString(36).slice(2, 12)}`;
  const review = await store.createReview({
    id,
    slug,
    userId: user.id,
    authorName: user.name,
    rating,
    title,
    body: reviewBody,
    createdAt: Date.now(),
    verifiedPurchase: true,
  });

  return ok({ review });
}
