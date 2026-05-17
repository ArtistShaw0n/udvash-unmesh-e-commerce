"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pushRecentlyViewed } from "@/lib/recently-viewed";
import { track, Events } from "@/lib/analytics";
import { getStock, type StockSnapshot } from "@/lib/inventory";
import { BookOpen, RotateCcw, Truck, ShoppingBag, Clock, Heart } from "lucide-react";
import { Badge, Button, CartIconButton } from "@/components/atoms";
import {
  BreadcrumbPill,
  CountdownTimer,
  InfoChip,
  NotifyMeForm,
  PriceBlock,
  QuantityCounter,
  SpecificationRow,
  ThumbnailButton,
} from "@/components/molecules";
import type { Book } from "@/lib/books";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useToast } from "@/lib/toast-context";
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
  const wishlist = useWishlist();
  const toast = useToast();
  const [activeThumb, setActiveThumb] = useState(0);
  // Local "how many to add" — applied to cart when Buy Now / cart icon is clicked.
  const [qty, setQty] = useState(1);

  const inWishlist = wishlist.hydrated ? wishlist.has(book.slug) : false;
  const [stock, setStock] = useState<StockSnapshot | null>(null);

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

  function handleWishlistToggle() {
    const added = wishlist.toggle(book.slug);
    if (added) toast.success("উইশলিস্টে যোগ হয়েছে");
    else toast.info("উইশলিস্ট থেকে সরানো হয়েছে");
  }

  return (
    <section className={clsx("section-pad-sm overflow-x-hidden", className)}>
      <div className="container-site grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2 lg:items-start">
        {/* Gallery — min-w-0 lets the grid item shrink under the content's intrinsic width */}
        <div className="space-y-4 min-w-0">
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

        {/* Info panel — min-w-0 prevents long titles from blowing out the grid */}
        <div className="space-y-5 min-w-0">
          <BreadcrumbPill category={book.categoryLabel} title="HSC Parallel Text" />

          <h1 className="text-h2 text-[var(--fg-primary)] tracking-tight break-words">
            {book.title}
          </h1>
          <p className="text-body text-[var(--fg-secondary)] leading-relaxed break-words">
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
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={inWishlist}
              className={clsx(
                "inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                inWishlist
                  ? "border-discount-300 bg-discount-50 text-discount-600 dark:bg-discount-900/20 dark:border-discount-700/40"
                  : "border-[var(--border-default)] text-[var(--fg-muted)] hover:border-discount-300 hover:text-discount-600",
              )}
            >
              <Heart size={18} fill={inWishlist ? "currentColor" : "none"} className="sm:hidden" />
              <Heart size={20} fill={inWishlist ? "currentColor" : "none"} className="hidden sm:block" />
            </button>
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

function CountdownTimerInline({ target }: { target: Date }) {
  return <CountdownTimer targetDate={target} tone="default" format="hms" className="!gap-0.5 [&>div]:bg-transparent [&>div]:p-0 [&>div]:min-w-0 [&_span:last-child]:hidden" />;
}
