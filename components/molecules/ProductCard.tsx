"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { PriceBlock } from "./PriceBlock";
import { QuantityCounter } from "./QuantityCounter";
import { clsx } from "@/lib/clsx";
import type { Book, BookBadge } from "@/lib/books";

export interface ProductCardProps {
  book: Book;
  className?: string;
}

export function ProductCard({ book, className }: ProductCardProps) {
  const [qty, setQty] = useState(0);
  const detailHref = `/products/${book.slug}`;

  const isStockOut = book.stock === "out-of-stock";
  const isPreorder = book.stock === "preorder";

  return (
    <div
      className={clsx(
        "group flex flex-col overflow-hidden rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-card hover:shadow-card-hover transition-shadow",
        className,
      )}
    >
      {/* Image area with badges */}
      <Link
        href={detailHref}
        className="relative block aspect-[4/5] bg-[var(--bg-surface-muted)] overflow-hidden"
        aria-label={book.titleBn}
      >
        <BookCoverPlaceholder />

        {/* Primary badge (corner-tl) */}
        {book.badge && (
          <Badge color={book.badge.type} variant="solid" placement="corner-tl"
                 className="absolute top-0 left-0">
            {book.badge.label}
          </Badge>
        )}
        {/* Secondary badge (corner-bl) */}
        {(book as unknown as { secondaryBadge?: BookBadge }).secondaryBadge && (
          <Badge
            color={(book as unknown as { secondaryBadge: BookBadge }).secondaryBadge.type}
            variant="solid"
            placement="corner-bl"
            className="absolute bottom-0 left-0"
          >
            {(book as unknown as { secondaryBadge: BookBadge }).secondaryBadge.label}
          </Badge>
        )}

        {/* Stock out overlay */}
        {isStockOut && (
          <div className="absolute inset-0 bg-neutral-400/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="-rotate-12 bg-neutral-700 text-white text-h4 font-black px-4 py-1 tracking-wider rounded-sm shadow-lg">
              STOCK OUT
            </span>
          </div>
        )}
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

        <div className="pt-1">
          <PriceBlock price={book.price} oldPrice={book.oldPrice} size="sm" />
        </div>

        {book.freeDelivery && !isStockOut && (
          <p className="text-caption text-success-700 dark:text-success-400 font-semibold flex items-center gap-1">
            ✓ Free Delivery
          </p>
        )}
        {isStockOut && (
          <p className="text-caption text-discount-700 dark:text-discount-400 font-semibold flex items-center gap-1">
            ✕ Stock Out
          </p>
        )}
        {isPreorder && (
          <p className="text-caption text-warning-700 dark:text-warning-400 font-semibold flex items-center gap-1">
            🟠 Pre Order
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center gap-2">
          {!isStockOut && (
            <QuantityCounter value={qty} onChange={setQty} />
          )}
          {isStockOut ? (
            <Button variant="ghost" size="sm" fullWidth disabled
                    className="!bg-[var(--bg-surface-muted)] !text-[var(--fg-muted)]">
              Stock Out
            </Button>
          ) : isPreorder ? (
            <Button variant="warning" size="sm" fullWidth>Pre Order</Button>
          ) : (
            <Button variant="primary" size="sm" fullWidth>Buy Now</Button>
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
        viewBox="0 0 120 160"
        className="w-3/5 h-auto text-[var(--fg-muted)] opacity-40"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="20" y="10" width="80" height="140" rx="4" />
        <rect x="20" y="10" width="6" height="140" fill="currentColor" opacity="0.6" />
      </svg>
    </div>
  );
}
