"use client";

import Link from "next/link";
import { Heart, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/atoms";
import { EmptyState, PriceBlock } from "@/components/molecules";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useToast } from "@/lib/toast-context";
import { getBookBySlug } from "@/lib/books";

export function WishlistView() {
  const { slugs, remove, clear } = useWishlist();
  const cart = useCart();
  const toast = useToast();

  const items = slugs
    .map((slug) => getBookBySlug(slug))
    .filter((b): b is NonNullable<typeof b> => !!b);

  function moveToCart(slug: string) {
    cart.addItem(slug, 1);
    remove(slug);
    toast.success("কার্টে যোগ হয়েছে");
  }

  function moveAll() {
    items.forEach((b) => cart.addItem(b.slug, 1));
    clear();
    toast.success("সব আইটেম কার্টে যোগ হয়েছে");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-h2 text-[var(--fg-primary)]">উইশলিস্ট</h1>
          <p className="text-body text-[var(--fg-secondary)] mt-1">
            আপনার পছন্দের বইসমূহ।
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="primary" leftIcon={<ShoppingCart size={16} />} onClick={moveAll}>
            সব কার্টে নিন
          </Button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <div
              key={b.slug}
              className="group flex flex-col overflow-hidden rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-card hover:shadow-card-hover transition-shadow"
            >
              <Link
                href={`/products/${b.slug}`}
                className="relative block aspect-square bg-[var(--bg-surface-muted)] overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <svg
                    viewBox="0 0 120 140"
                    className="w-3/5 h-auto text-[var(--fg-muted)] opacity-40"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <rect x="20" y="10" width="80" height="120" rx="4" />
                    <rect x="20" y="10" width="6" height="120" fill="currentColor" opacity="0.6" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    remove(b.slug);
                    toast.info("উইশলিস্ট থেকে সরানো হয়েছে");
                  }}
                  aria-label="Remove from wishlist"
                  className="absolute top-2 right-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--fg-muted)] hover:text-discount-600 hover:border-discount-300 shadow-card"
                >
                  <X size={14} />
                </button>
              </Link>

              <div className="flex flex-col flex-1 p-4 space-y-2">
                <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  {b.categoryLabel}
                </p>
                <Link href={`/products/${b.slug}`} className="block">
                  <h3 className="text-body font-bold text-[var(--fg-primary)] leading-snug line-clamp-2 hover:text-brand-700 transition-colors">
                    {b.title}
                  </h3>
                </Link>
                <div className="pt-1">
                  <PriceBlock price={b.price} oldPrice={b.oldPrice} size="sm" />
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    leftIcon={<ShoppingCart size={14} />}
                    onClick={() => moveToCart(b.slug)}
                  >
                    কার্টে নিন
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart size={36} />}
          title="উইশলিস্ট খালি"
          description="পছন্দের বই উইশলিস্টে যোগ করুন পরে কেনাকাটার জন্য।"
          cta={<Button href="/products" variant="primary">বই দেখুন</Button>}
        />
      )}
    </div>
  );
}
