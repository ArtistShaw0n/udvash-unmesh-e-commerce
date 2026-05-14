"use client";

import { useState } from "react";
import { BookOpen, RotateCcw, Truck, ShoppingBag, Clock } from "lucide-react";
import { Badge, Button } from "@/components/atoms";
import {
  CountdownTimer,
  InfoChip,
  PriceBlock,
  QuantityCounter,
  SpecificationRow,
  ThumbnailButton,
} from "@/components/molecules";
import type { Book } from "@/lib/books";
import { toBengaliNumber } from "@/lib/site";
import { clsx } from "@/lib/clsx";

export interface ProductDetailHeroProps {
  book: Book;
  offerEndsAt?: Date;
  className?: string;
}

export function ProductDetailHero({ book, offerEndsAt, className }: ProductDetailHeroProps) {
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty] = useState(0);

  return (
    <section className={clsx("section-pad-sm", className)}>
      <div className="container-site grid gap-8 lg:gap-12 lg:grid-cols-2 lg:items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-[var(--bg-surface-muted)] border border-[var(--border-default)]">
            <BookCover />
            {book.badge && book.badge.type === "bestseller" && (
              <Badge color="bestseller" variant="solid" placement="corner-tl"
                     className="absolute top-0 left-0">
                {book.badge.label}
              </Badge>
            )}
          </div>
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <ThumbnailButton key={i} active={i === activeThumb} onClick={() => setActiveThumb(i)} />
            ))}
          </div>
          <Button variant="secondary" leftIcon={<BookOpen size={18} />} fullWidth>
            একটু পড়ুন (প্রিভিউ)
          </Button>
        </div>

        {/* Info panel */}
        <div className="space-y-5">
          <Badge color="bestseller" variant="soft">
            {book.categoryLabel} · HSC Parallel Text
          </Badge>

          <h1 className="text-h2 text-[var(--fg-primary)] tracking-tight">
            {book.title}
          </h1>
          <p className="text-body text-[var(--fg-secondary)] leading-relaxed">
            {book.description}
          </p>

          <div className="rounded-lg bg-brand-50 dark:bg-brand-700/15 border border-brand-100 dark:border-brand-700/30 p-4 sm:p-5 space-y-3">
            <PriceBlock price={book.price} oldPrice={book.oldPrice} size="lg" />
            {offerEndsAt && (
              <div className="flex items-center gap-2 text-body-sm text-[var(--fg-secondary)]">
                <Clock size={16} className="text-brand-700 dark:text-brand-400" />
                <span>অফার শেষ হতে বাকি:</span>
                <span className="font-bold text-brand-700 dark:text-brand-400 tabular-nums">
                  <CountdownTimerInline target={offerEndsAt} />
                </span>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-h4 text-[var(--fg-primary)] mb-2">স্পেসিফিকেশন</h2>
            <dl className="divide-y divide-[var(--border-muted)]">
              <SpecificationRow label="লেখক:" value={book.author} />
              <SpecificationRow label="পৃষ্ঠা সংখ্যা:" value={toBengaliNumber(book.pages)} />
              <SpecificationRow label="ভার্সন:" value={book.version} />
              <SpecificationRow label="সংস্করণ:" value={book.edition} />
            </dl>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <InfoChip icon={<RotateCcw size={18} />} label="৭ দিনের রিটার্ন পলিসি" />
            <InfoChip icon={<Truck size={18} />} label="ফ্রি ডেলিভারি প্রযোজ্য" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <QuantityCounter value={qty} onChange={setQty} />
            <Button variant="primary" size="lg" fullWidth leftIcon={<ShoppingBag size={18} />}>
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookCover() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-12">
      <svg viewBox="0 0 120 160" className="w-full h-auto text-[var(--fg-muted)] opacity-40" fill="currentColor" aria-hidden="true">
        <rect x="10" y="5" width="100" height="150" rx="4" />
        <rect x="10" y="5" width="8" height="150" fill="currentColor" opacity="0.6" />
      </svg>
    </div>
  );
}

/** Inline minimal countdown — just "HH:MM:SS" tick, used inside price box. */
function CountdownTimerInline({ target }: { target: Date }) {
  return <CountdownTimer targetDate={target} tone="default" format="hms" className="!gap-0.5 [&>div]:bg-transparent [&>div]:p-0 [&>div]:min-w-0 [&_span:last-child]:hidden" />;
}
