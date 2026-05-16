"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlarmClock, Check, X } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { CartIconButton } from "@/components/atoms/CartIconButton";
import { StockOutOverlay } from "@/components/atoms/StockOutOverlay";
import { PriceBlock } from "./PriceBlock";
import { QuantityCounter } from "./QuantityCounter";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { clsx } from "@/lib/clsx";
import type { Book, BookBadge } from "@/lib/books";

export interface ProductCardProps {
  book: Book;
  className?: string;
}

export function ProductCard({ book, className }: ProductCardProps) {
  const router = useRouter();
  const { getQuantity, setQuantity, addItem, hydrated } = useCart();
  const toast = useToast();

  const qty = hydrated ? getQuantity(book.slug) : 0;
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

  return (
    <div
      className={clsx(
        "group flex flex-col overflow-hidden rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-card hover:shadow-card-hover transition-shadow",
        className,
      )}
    >
      {/* Image — square aspect */}
      <Link
        href={detailHref}
        className="relative block aspect-square bg-[var(--bg-surface-muted)] overflow-hidden"
        aria-label={book.titleBn}
      >
        <BookCoverPlaceholder />

        {/* Top-left badge row: primary + (optional) secondary, ribbon-style flush */}
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

        {/* Stock-out diagonal sticker */}
        {isStockOut && <StockOutOverlay />}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
          {book.categoryLabel}
        </p>
        <Link href={detailHref} className="block mt-2">
          <h3 className="text-body font-bold text-[var(--fg-primary)] leading-snug line-clamp-2 hover:text-brand-700 dark:hover:text-brand-400 transition-colors min-h-[2.6em]">
            {book.title}
          </h3>
        </Link>
        <p className="text-caption text-[var(--fg-secondary)] line-clamp-2 min-h-[2em] mt-2">
          {book.descriptionBn}
        </p>

        {/* Divider between description and price (matches reference) */}
        <hr className="border-t border-[var(--border-muted)] my-3" />

        <PriceBlock price={book.price} oldPrice={book.oldPrice} size="sm" />

        {/* Status row — one of: Free Delivery / Pre Order / Stock Out (mutually exclusive) */}
        <div className="mt-2 min-h-[1.25em]">
          {isStockOut ? (
            <p className="text-caption text-discount-700 dark:text-discount-400 font-semibold inline-flex items-center gap-1">
              <X size={12} strokeWidth={3} /> Stock Out
            </p>
          ) : isPreorder ? (
            <p className="text-caption text-warning-700 dark:text-warning-400 font-semibold inline-flex items-center gap-1.5">
              <AlarmClock size={12} /> Pre Order
            </p>
          ) : book.freeDelivery ? (
            <p className="text-caption text-success-700 dark:text-success-400 font-semibold inline-flex items-center gap-1">
              <Check size={12} strokeWidth={3} /> Free Delivery
            </p>
          ) : null}
        </div>

        {/* Action row: counter + CTA + cart icon */}
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
