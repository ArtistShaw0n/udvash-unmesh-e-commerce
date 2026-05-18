"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pushRecentlyViewed } from "@/lib/recently-viewed";
import { track, Events } from "@/lib/analytics";
import { getStock, type StockSnapshot } from "@/lib/inventory";
import { BookOpen, RotateCcw, Truck, ShoppingBag, Clock } from "lucide-react";
import { Badge, Button, CartIconButton } from "@/components/atoms";
import {
  BookPreviewModal,
  BreadcrumbPill,
  CountdownInline,
  InfoChip,
  NotifyMeForm,
  PriceBlock,
  QuantityCounter,
  SpecificationRow,
  ThumbnailButton,
} from "@/components/molecules";
import type { Book } from "@/lib/books";
import { useCart } from "@/lib/cart-context";
import { toBengaliNumber } from "@/lib/site";
import { clsx } from "@/lib/clsx";

export interface ProductDetailHeroProps {
  book: Book;
  offerEndsAt?: Date;
  className?: string;
}

export function ProductDetailHero({ book, offerEndsAt, className }: ProductDetailHeroProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [activeThumb, setActiveThumb] = useState(0);
  // Local "how many to add" — applied to cart when Buy Now / cart icon is clicked.
  const [qty, setQty] = useState(1);

  const [stock, setStock] = useState<StockSnapshot | null>(null);

  // Preview modal — Figma 9:4879. Triggered by the "একটু পড়ুন (প্রিভিউ)"
  // button below the gallery. Track open analytics on first open.
  const [previewOpen, setPreviewOpen] = useState(false);

  // Track product view + push to recently-viewed list on mount.
  // Also read inventory snapshot client-side (server doesn't know about adjustments).
  useEffect(() => {
    pushRecentlyViewed(book.slug);
    setStock(getStock(book.slug));
    track({
      name: Events.product_view,
      props: { slug: book.slug, category: book.category, price: book.price },
    });
  }, [book.slug, book.category, book.price]);

  const isStockOut =
    stock?.status === "out-of-stock" || book.stock === "out-of-stock";
  const isLowStock = stock?.status === "low-stock";

  function handleBuyNow() {
    addItem(book.slug, Math.max(1, qty));
    router.push("/cart");
  }

  function handleAddToCartIcon() {
    addItem(book.slug, Math.max(1, qty));
  }

  return (
    <section className={clsx("section-pad-sm overflow-x-hidden", className)}>
      <div className="container-site">
        {/* Figma 9:4771 — entire hero sits inside one rounded white card
            with shadow. Card padding ~32 on lg, smaller on sm. The inner
            grid is two columns (gallery + info) on lg, stacked below. */}
        <div
          data-figma-id="product-detail.hero-card"
          className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-card p-5 sm:p-6 lg:p-8 grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2 lg:items-start"
        >
        {/* Gallery — min-w-0 lets the grid item shrink under the content's intrinsic width */}
        <div className="space-y-4 min-w-0">
          <div className="relative aspect-[4/5] w-full rounded-md overflow-hidden bg-[var(--bg-surface-muted)] border border-[var(--border-default)]">
            <BookCover />
            {book.badge && book.badge.type === "bestseller" && (
              <Badge color="bestseller" variant="solid" placement="corner-tl"
                     className="absolute top-0 left-0">
                {book.badge.label}
              </Badge>
            )}
          </div>
          <div className="flex gap-3" role="tablist" aria-label="Book image thumbnails">
            {[0, 1, 2].map((i) => (
              <ThumbnailButton
                key={i}
                index={i + 1}
                active={i === activeThumb}
                onClick={() => setActiveThumb(i)}
              />
            ))}
          </div>
          <Button
            variant="secondary"
            leftIcon={<BookOpen size={18} />}
            fullWidth
            onClick={() => setPreviewOpen(true)}
          >
            একটু পড়ুন (প্রিভিউ)
          </Button>
        </div>

        {/* Info panel — min-w-0 prevents long titles from blowing out the grid */}
        <div className="space-y-5 min-w-0" data-figma-id="product-detail.info">
          <BreadcrumbPill category={book.categoryLabel} title="HSC Parallel Text" />

          <h1
            data-figma-id="product-detail.title"
            className="text-h2 text-[var(--fg-primary)] tracking-tight break-words"
          >
            {book.title}
          </h1>
          <p
            data-figma-id="product-detail.description"
            className="text-body text-[var(--fg-secondary)] leading-relaxed break-words"
          >
            {book.description}
          </p>

          <div
            data-figma-id="product-detail.price-block"
            className="rounded-md bg-brand-50 dark:bg-brand-700/15 border border-brand-100 dark:border-brand-700/30 p-4 sm:p-5 space-y-3"
          >
            <PriceBlock price={book.price} oldPrice={book.oldPrice} size="lg" />
            {offerEndsAt && (
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-body-sm text-[var(--fg-secondary)]">
                <Clock size={16} className="text-brand-700 dark:text-brand-400" />
                <span>অফার শেষ হতে বাকি:</span>
                <CountdownInline targetDate={offerEndsAt} variant="chip" />
              </div>
            )}
          </div>

          <div data-figma-id="product-detail.specs">
            <h2 className="text-h4 text-[var(--fg-primary)] mb-2">স্পেসিফিকেশন</h2>
            <dl className="divide-y divide-[var(--border-muted)]">
              <SpecificationRow label="লেখক:" value={book.author} />
              <SpecificationRow label="পৃষ্ঠা সংখ্যা:" value={toBengaliNumber(book.pages)} />
              <SpecificationRow label="ভার্সন:" value={book.version} />
              <SpecificationRow label="সংস্করণ:" value={book.edition} />
            </dl>
          </div>

          <div
            data-figma-id="product-detail.info-chips"
            className="grid sm:grid-cols-2 gap-3"
          >
            <InfoChip icon={<RotateCcw size={18} />} label="৭ দিনের রিটার্ন পলিসি" />
            <InfoChip icon={<Truck size={18} />} label="ফ্রি ডেলিভারি প্রযোজ্য" />
          </div>

          {/* Low-stock urgency badge */}
          {isLowStock && stock && (
            <p className="text-body-sm font-semibold text-warning-700 dark:text-warning-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-warning-500 animate-pulse" />
              শুধু {stock.units} কপি অবশিষ্ট — তাড়াতাড়ি অর্ডার করুন
            </p>
          )}

          {/* Out-of-stock variant: replace the action row with a notify-me form */}
          {isStockOut && <NotifyMeForm slug={book.slug} />}

          {/* Bottom row — responsive: tighter on mobile, full on desktop */}
          <div className="flex items-center gap-2 sm:gap-3 pt-2">
            <QuantityCounter
              value={qty}
              min={1}
              onChange={setQty}
              size="detail"
              className="hidden sm:inline-flex"
            />
            <QuantityCounter
              value={qty}
              min={1}
              onChange={setQty}
              size="card"
              className="sm:hidden"
            />
            <Button
              variant="primary"
              size={{ base: "md", md: "lg" }}
              fullWidth
              leftIcon={<ShoppingBag size={18} />}
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
            <CartIconButton size="md" className="sm:hidden" onClick={handleAddToCartIcon} />
            <CartIconButton size="lg" className="hidden sm:inline-flex" onClick={handleAddToCartIcon} />
          </div>
        </div>
        </div>
      </div>

      <BookPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`${book.titleBn} — প্রিভিউ`}
      />
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

