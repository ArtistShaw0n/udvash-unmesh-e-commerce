"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, PenSquare } from "lucide-react";
import { Button, StarRating } from "@/components/atoms";
import { FormField } from "@/components/molecules";
import { useAuth } from "@/lib/auth-context";
import { useOrders, formatBnDate } from "@/lib/orders-store";
import { useReviews } from "@/lib/reviews-store";
import { useToast } from "@/lib/toast-context";
import { toBengaliNumber } from "@/lib/site";
import { clsx } from "@/lib/clsx";

export interface ReviewsSectionProps {
  slug: string;
  className?: string;
}

/**
 * Product reviews block — rating summary, per-star distribution bars,
 * "write a review" form (only for logged-in customers who purchased it),
 * paginated review list.
 */
export function ReviewsSection({ slug, className }: ReviewsSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { ordersFor } = useOrders();
  const { forSlug, summaryFor, hasReviewed, addReview, ensureLoaded } = useReviews();
  const toast = useToast();

  const [visible, setVisible] = useState(3);
  const [composing, setComposing] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Lazy-load reviews for this slug on mount
  useEffect(() => {
    void ensureLoaded(slug);
  }, [slug, ensureLoaded]);

  const list = forSlug(slug);
  const visibleList = list.slice(0, visible);
  const summary = summaryFor(slug);

  // Did the user buy this book?
  const userBoughtIt =
    user
      ? ordersFor(user.email).some((o) =>
          o.items.some((i) => i.slug === slug),
        )
      : false;

  const alreadyReviewed = user ? hasReviewed(slug) : false;
  const canWriteReview = user && userBoughtIt && !alreadyReviewed;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (rating < 1) {
      toast.error("রেটিং সিলেক্ট করুন");
      return;
    }
    if (!body.trim()) {
      toast.error("আপনার মন্তব্য লিখুন");
      return;
    }
    setSubmitting(true);
    const result = await addReview({
      slug,
      rating,
      title: title.trim() || "—",
      body: body.trim(),
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("রিভিউ যুক্ত হয়েছে। ধন্যবাদ!");
    setComposing(false);
    setRating(0);
    setTitle("");
    setBody("");
  }

  return (
    <section className={clsx("section-pad-sm", className)}>
      <div className="container-site space-y-6">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-h2 text-[var(--fg-primary)]">রিভিউ ও রেটিং</h2>
            <p className="text-body-sm text-[var(--fg-secondary)] mt-1">
              {summary.count > 0
                ? `${toBengaliNumber(summary.count)} জন কাস্টমারের অভিজ্ঞতা`
                : "এই বইয়ের জন্য এখনও কোন রিভিউ নেই"}
            </p>
          </div>
          {canWriteReview && !composing && (
            <Button
              variant="primary"
              size={{ base: "sm", md: "md" }}
              leftIcon={<PenSquare size={16} />}
              onClick={() => setComposing(true)}
            >
              রিভিউ লিখুন
            </Button>
          )}
          {user && !userBoughtIt && (
            <p className="text-caption text-[var(--fg-muted)]">
              রিভিউ লিখতে এই বইটি আপনার অর্ডারে থাকতে হবে
            </p>
          )}
          {user && alreadyReviewed && (
            <p className="text-caption text-[var(--fg-muted)] flex items-center gap-1">
              <ShieldCheck size={14} /> আপনি ইতিমধ্যে রিভিউ দিয়েছেন
            </p>
          )}
          {!user && summary.count > 0 && (
            <Button
              variant="secondary"
              size={{ base: "sm", md: "md" }}
              onClick={() => router.push(`/login?next=/products/${slug}`)}
            >
              লগইন করে রিভিউ দিন
            </Button>
          )}
        </div>

        {/* Summary + distribution */}
        {summary.count > 0 && (
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="text-center md:border-r md:border-[var(--border-muted)] md:pr-6">
              <p className="text-h1 font-bold text-[var(--fg-primary)] tabular-nums">
                {toBengaliNumber(summary.average)}
              </p>
              <StarRating value={summary.average} size={18} className="mt-1 justify-center" />
              <p className="text-caption text-[var(--fg-muted)] mt-1">
                {toBengaliNumber(summary.count)} টি রিভিউ
              </p>
            </div>
            <div className="space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const pct =
                  summary.count > 0
                    ? Math.round((summary.distribution[star] / summary.count) * 100)
                    : 0;
                return (
                  <div key={star} className="flex items-center gap-3 text-caption">
                    <span className="w-8 text-[var(--fg-secondary)] flex items-center gap-1 tabular-nums">
                      {toBengaliNumber(star)}★
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                      <div
                        className="h-full bg-warning-500"
                        style={{ width: `${pct}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="w-10 text-right text-[var(--fg-muted)] tabular-nums">
                      {toBengaliNumber(summary.distribution[star])}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Compose form */}
        {composing && (
          <form
            onSubmit={handleSubmit}
            className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card space-y-4"
          >
            <h3 className="text-h3 text-[var(--fg-primary)]">আপনার রিভিউ</h3>
            <div>
              <label className="block text-body-sm font-semibold text-[var(--fg-primary)] mb-2">
                রেটিং
              </label>
              <StarRating value={rating} onChange={setRating} size={28} />
            </div>
            <FormField
              id="review-title"
              label="শিরোনাম (ঐচ্ছিক)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: অসাধারণ বই"
            />
            <div className="space-y-1.5">
              <label
                htmlFor="review-body"
                className="block text-body-sm font-semibold text-[var(--fg-primary)]"
              >
                আপনার মন্তব্য
              </label>
              <textarea
                id="review-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                required
                className="w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-body text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="অভিজ্ঞতা লিখুন — অন্যদের সিদ্ধান্ত নিতে সাহায্য করবে।"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={() => setComposing(false)}>
                বাতিল
              </Button>
              <Button type="submit" variant="primary">
                পোস্ট করুন
              </Button>
            </div>
          </form>
        )}

        {/* Review list */}
        {visibleList.length > 0 && (
          <ul className="space-y-4">
            {visibleList.map((r) => (
              <li
                key={r.id}
                className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-body font-semibold text-[var(--fg-primary)]">
                        {r.authorName}
                      </p>
                      {r.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-caption font-bold bg-success-100 text-success-800 dark:bg-success-700/30 dark:text-success-300">
                          <ShieldCheck size={11} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-caption text-[var(--fg-muted)] mt-0.5">
                      {formatBnDate(r.createdAt)}
                    </p>
                  </div>
                  <StarRating value={r.rating} size={14} />
                </div>
                {r.title && r.title !== "—" && (
                  <p className="text-body-sm font-semibold text-[var(--fg-primary)] mt-3">
                    {r.title}
                  </p>
                )}
                <p className="text-body-sm text-[var(--fg-secondary)] mt-2 leading-relaxed">
                  {r.body}
                </p>
              </li>
            ))}
          </ul>
        )}

        {list.length > visible && (
          <div className="flex justify-center">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setVisible((v) => v + 3)}
            >
              আরও দেখুন ({toBengaliNumber(list.length - visible)})
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
