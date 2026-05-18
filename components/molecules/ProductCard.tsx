"use client";

import Link from "next/link";
import { AlarmClock, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
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

/**
 * ProductCard — implemented strictly from the Figma export (`udvash-roadmap copy.docx`).
 *
 * Hard-coded sizes per Figma:
 *   • Card        306 × 520, padding 10/10/12, radius 10
 *   • Image area  286 × 256, bg #F7F9FB, radius 5
 *   • Body        286 × 242, padding-top 12, gap 8
 *   • Action row  286 × 34, justify-space-between
 *     - Counter   90 × 34
 *     - Add to Cart button 130 × 34
 *     - Cart icon button 34 × 34
 *
 * Variants (driven by book.stock + book.badge + secondaryBadge):
 *   • Discount → red pill
 *   • Pre Order → orange pill + AlarmClock status + orange "Pre Order" button
 *   • Best Seller (+ Discount) → blue pill (+ red pill), Save badge uses brand tone
 *   • Stock Out → grey overlay + diagonal sticker, single full-width disabled
 *     "Stock Out" button + disabled cart icon, no counter
 */
export function ProductCard({ book, className }: ProductCardProps) {
  const { getQuantity, setQuantity, addItem, hydrated } = useCart();
  const toast = useToast();

  const qty = hydrated ? getQuantity(book.slug) : 0;
  const detailHref = `/products/${book.slug}`;

  const isStockOut = book.stock === "out-of-stock";
  const isPreorder = book.stock === "preorder";
  const secondary = (book as unknown as { secondaryBadge?: BookBadge }).secondaryBadge;
  const hasBestSeller =
    book.badge?.type === "bestseller" || secondary?.type === "bestseller";

  function handleAddToCart() {
    addItem(book.slug, 1);
    toast.success("কার্টে যোগ হয়েছে");
  }

  return (
    <div
      className={clsx(
        // 306 max width card with 10/10/12 padding, 10px radius, white bg, soft shadow
        "flex flex-col w-full max-w-[306px] mx-auto pt-[10px] px-[10px] pb-[12px] rounded-md bg-white dark:bg-[var(--bg-surface)] shadow-card hover:shadow-card-hover transition-shadow",
        className,
      )}
    >
      {/* Image area — aspect 286/256, #F7F9FB, badges sit absolutely
          at 10/10. The link is decorative — the title <Link> below
          gives the same target an accessible name via visible text, so
          this one is `aria-hidden` + `tabIndex=-1` to skip it for
          screen-reader users (avoids the WCAG 2.5.3 Label-in-Name
          mismatch axe-core flags when an aria-label has no matching
          visible text inside). Sighted mouse users can still click
          the image as usual. */}
      <Link
        href={detailHref}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block w-full aspect-[286/256] rounded-xs overflow-hidden bg-[var(--color-bg-page-muted)] dark:bg-[var(--bg-surface-muted)]"
      >
        <BookCoverPlaceholder />

        {/* Tag pills at top-left */}
        {(book.badge || secondary) && (
          <div className="absolute top-[10px] left-[10px] flex items-center gap-[12px]">
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

        {isStockOut && <StockOutOverlay />}
      </Link>

      {/* Body — full width inside card padding, padding-top 12, gap 8 */}
      <div className="flex flex-col w-full pt-3 gap-2 flex-1">
        {/* Category label */}
        <p className="font-poppins font-medium text-[10px] leading-[24px] tracking-[0.2px] uppercase text-[var(--color-text-body)]">
          {book.categoryLabel}
        </p>

        {/* Title + description — gap 4 */}
        <div className="flex flex-col gap-1">
          <Link href={detailHref}>
            <h3 className="font-poppins font-bold text-[14px] leading-[22px] tracking-[0.1px] text-[var(--color-text-title)] dark:text-white line-clamp-2 min-h-[44px] hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              {book.title}
            </h3>
          </Link>
          <p className="font-poppins font-normal text-[12px] leading-[16px] tracking-[0.2px] text-[var(--color-text-body)] dark:text-[var(--fg-secondary)] line-clamp-2 min-h-[32px]">
            {book.descriptionBn}
          </p>
        </div>

        {/* Divider — Vector 2 */}
        <hr className="border-0 border-t border-brand-100 dark:border-[var(--border-muted)] w-full" />

        {/* Price row */}
        <PriceBlock
          price={book.price}
          oldPrice={book.oldPrice}
          size="sm"
          saveVariant={hasBestSeller ? "brand" : "discount"}
        />

        {/* Status indicator — exactly one of Free Delivery / Pre Order / Stock Out */}
        <div className="flex items-center gap-1 min-h-[16px]">
          {isStockOut ? <StockOutStatus /> : isPreorder ? <PreOrderStatus /> : book.freeDelivery ? <FreeDeliveryStatus /> : null}
        </div>

        {/* Action row — Figma "Frame 931" justify-space-between */}
        <div className="mt-auto flex items-center justify-between gap-3 w-full pt-1">
          {isStockOut ? (
            <>
              <button
                type="button"
                disabled
                className="flex-1 h-[34px] inline-flex items-center justify-center rounded-xs bg-[var(--color-text-disabled)] text-[var(--color-text-body)] font-poppins font-normal text-[14px] leading-[21px] cursor-not-allowed"
              >
                Stock Out
              </button>
              <button
                type="button"
                disabled
                aria-label="Cart"
                className="w-[34px] h-[34px] inline-flex items-center justify-center rounded-xs bg-white border border-[var(--color-text-disabled)] cursor-not-allowed"
              >
                <ShoppingCart size={18} className="text-[var(--color-text-disabled)]" />
              </button>
            </>
          ) : (
            <>
              <QuantityCounter
                value={qty}
                onChange={(next) => setQuantity(book.slug, next)}
                size="card"
              />
              <button
                type="button"
                onClick={handleAddToCart}
                className={clsx(
                  // Figma target 130×34; allow shrink/grow on narrower cards.
                  "flex-1 min-w-0 max-w-[130px] h-[34px] inline-flex items-center justify-center rounded-xs font-poppins font-normal text-[14px] leading-[21px] text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500",
                  isPreorder ? "bg-warning-700" : "bg-brand-600",
                )}
              >
                {isPreorder ? "Pre Order" : "Buy Now"}
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label="Buy now"
                className="w-[34px] h-[34px] inline-flex items-center justify-center rounded-xs bg-white border border-brand-600 hover:bg-brand-600/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 transition-colors"
              >
                <ShoppingCart size={18} className="text-brand-600" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status indicators                                                  */
/* ------------------------------------------------------------------ */

function FreeDeliveryStatus() {
  return (
    <>
      <CheckIcon />
      <span className="font-poppins font-medium text-[12px] leading-4 text-brand-600">
        Free Delivery
      </span>
    </>
  );
}

function PreOrderStatus() {
  return (
    <>
      <AlarmClock size={14} className="text-warning-700" strokeWidth={2} />
      <span className="font-poppins font-medium text-[12px] leading-4 text-warning-700">
        Pre Order
      </span>
    </>
  );
}

function StockOutStatus() {
  return (
    <>
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-[2px] bg-badge-discount"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-poppins font-medium text-[12px] leading-4 text-badge-discount">
        Stock Out
      </span>
    </>
  );
}

/** Free-delivery check icon — outlined teal #006D77, ~14px box. */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.33 7.5L5.5 10.67L11.67 4.5"
        stroke="#006D77"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Book cover placeholder                                             */
/* ------------------------------------------------------------------ */

function BookCoverPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-4">
      <svg
        viewBox="0 0 140 160"
        className="w-[180px] h-auto drop-shadow-[0_8px_14px_rgba(0,0,0,0.12)]"
        aria-hidden="true"
      >
        {/* Page edges */}
        <rect x="100" y="14" width="14" height="138" rx="1.5" fill="#f4ecdc" />
        <line x1="105" y1="22" x2="105" y2="146" stroke="#dccaa4" strokeWidth="0.5" />
        <line x1="109" y1="22" x2="109" y2="146" stroke="#dccaa4" strokeWidth="0.5" />
        {/* Cover */}
        <rect x="22" y="10" width="84" height="142" rx="2" fill="#006D77" />
        <rect x="22" y="10" width="6" height="142" fill="#054f51" />
        {/* Title band */}
        <rect x="30" y="22" width="68" height="20" rx="2" fill="#f3f9f8" />
        {/* Center mark */}
        <circle cx="64" cy="85" r="18" fill="#fffaf2" opacity="0.95" />
        <circle cx="64" cy="85" r="14" fill="#006D77" />
        <text x="64" y="91" fontSize="9" fontWeight="700" textAnchor="middle" fill="#f3f9f8">
          উদ্ভাস
        </text>
        {/* Bottom band */}
        <rect x="30" y="135" width="68" height="10" rx="1.5" fill="#f3f9f8" />
      </svg>
    </div>
  );
}
