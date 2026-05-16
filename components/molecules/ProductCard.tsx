"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Clock } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { CartIconButton } from "@/components/atoms/CartIconButton";
import { StockOutOverlay } from "@/components/atoms/StockOutOverlay";
import { PriceBlock } from "./PriceBlock";
import { QuantityCounter } from "./QuantityCounter";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { useWishlist } from "@/lib/wishlist-context";
import { clsx } from "@/lib/clsx";
import type { Book, BookBadge } from "@/lib/books";

export interface ProductCardProps {
  book: Book;
  className?: string;
}

export function ProductCard({ book, className }: ProductCardProps) {
  const router = useRouter();
  const { getQuantity, setQuantity, addItem, hydrated } = useCart();
  const wishlist = useWishlist();
  const toast = useToast();

  const qty = hydrated ? getQuantity(book.slug) : 0;
  const inWishlist = wishlist.hydrated ? wishlist.has(book.slug) : false;
  const detailHref = `/products/${book.slug}`;

  const isStockOut = book.stock === "out-of-stock";
  const isPreorder = book.stock === "preorder";
  const secondary = (book as unknown as { secondaryBadge?: BookBadge }).secondaryBadge;

  function handleBuyNow() {
    if (qty === 0) addItem(book.slug, 1);
    router.push("/cart");
  }

  function handleAddToCartIcon() {
    addItem(book.slug, 1);
    toast.success("কার্টে যোগ হয়েছে");
  }

  function handleWishlistToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const added = wishlist.toggle(book.slug);
    if (added) toast.success("উইশলিস্টে যোগ হয়েছে");
    else toast.info("উইশলিস্ট থেকে সরানো হয়েছে");
  }

  return (
    <div
      className={clsx(
        "group flex flex-col overflow-hidden rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-card hover:shadow-card-hover transition-shadow",
        className,
      )}
    >
      {/* Image area — square aspect */}
      <Link
        href={detailHref}
        className="relative block aspect-square bg-[var(--bg-surface-muted)] overflow-hidden"
        aria-label={book.titleBn}
      >
        <BookCoverPlaceholder />

        {/* Top-left badge stack: primary first, secondary inline */}
        {(book.badge || secondary) && (
          <div className="absolute top-0 left-0 flex items-stretch">
            {book.badge && (
              <Badge color={book.badge.type} variant="solid" placement="corner-tl">
                {book.badge.label}
              </Badge>
            )}
            {secondary && (
              <Badge color={secondary.type} variant="solid" placement="corner-tl">
                {secondary.label}
              </Badge>
            )}
          </div>
        )}

        {/* Top-right wishlist heart — subtle, fades in on hover; stays visible
            when the item is already in wishlist so users can find it again. */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={inWishlist}
          className={clsx(
            "absolute top-2 right-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-sm border shadow-card transition-all",
            "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
            inWishlist
              ? "opacity-100 border-discount-300 text-discount-600 hover:bg-discount-50"
              : "opacity-0 group-hover:opacity-100 border-[var(--border-default)] text-[var(--fg-muted)] hover:text-discount-600 hover:border-discount-300",
          )}
        >
          <Heart size={14} fill={inWishlist ? "currentColor" : "none"} />
        </button>

        {/* Stock out diagonal sticker */}
        {isStockOut && <StockOutOverlay />}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 space-y-2">
        <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
          {book.categoryLabel}
        </p>
        <Link href={detailHref} className="block">
          <h3 className="text-body font-bold text-[var(--fg-primary)] leading-snug line-clamp-2 hover:text-brand-700 dark:hover:text-brand-400 transition-colors min-h-[2.6em]">
            {book.title}
          </h3>
        </Link>
        <p className="text-caption text-[var(--fg-secondary)] line-clamp-2 min-h-[2em]">
          {book.descriptionBn}
        </p>

        {/* Divider above price (matches reference) */}
        <hr className="border-t border-[var(--border-muted)] !mt-3" />

        <div className="pt-1">
          <PriceBlock price={book.price} oldPrice={book.oldPrice} size="sm" />
        </div>

        {book.freeDelivery && !isStockOut && !isPreorder && (
          <p className="text-caption text-success-700 dark:text-success-400 font-semibold inline-flex items-center gap-1">
            <CheckMark /> Free Delivery
          </p>
        )}
        {isStockOut && (
          <p className="text-caption text-discount-700 dark:text-discount-400 font-semibold inline-flex items-center gap-1">
            <CrossMark /> Stock Out
          </p>
        )}
        {isPreorder && (
          <p className="text-caption text-warning-700 dark:text-warning-400 font-semibold inline-flex items-center gap-1.5">
            <Clock size={12} /> Pre Order
          </p>
        )}

        {/* Bottom row — [counter] [Buy Now] [cart icon] (matches reference) */}
        <div className="mt-auto pt-3 flex items-center gap-2">
          {!isStockOut && (
            <QuantityCounter
              value={qty}
              onChange={(next) => setQuantity(book.slug, next)}
            />
          )}
          {isStockOut ? (
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              disabled
              className="!bg-[var(--bg-surface-muted)] !text-[var(--fg-muted)]"
            >
              Stock Out
            </Button>
          ) : isPreorder ? (
            <>
              <Button variant="warning" size="sm" fullWidth onClick={handleBuyNow}>
                Pre Order
              </Button>
              <CartIconButton size="sm" onClick={handleAddToCartIcon} />
            </>
          ) : (
            <>
              <Button variant="primary" size="sm" fullWidth onClick={handleBuyNow}>
                Buy Now
              </Button>
              <CartIconButton size="sm" onClick={handleAddToCartIcon} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Small inline check/cross marks so we don't pull a full icon for one glyph. */
function CheckMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="flex-shrink-0">
      <path
        d="M2 6.5L4.5 9L10 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="flex-shrink-0">
      <path
        d="M3 3L9 9M9 3L3 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookCoverPlaceholder() {
  return (
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
  );
}
