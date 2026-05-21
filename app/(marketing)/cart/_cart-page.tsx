"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { Button, Checkbox } from "@/components/atoms";
import {
  CartItemRow,
  EmptyState,
  OrderSummaryCard,
  type CartItem as RowItem,
} from "@/components/molecules";
import { useCart } from "@/lib/cart-context";
import { getBookBySlug } from "@/lib/books";
import { toBengaliNumber } from "@/lib/site";

const VAT_RATE = 0.05;
const SHIPPING_FLAT = 50;

export function CartPage() {
  const router = useRouter();
  const {
    items,
    hydrated,
    itemCount,
    selectedCount,
    allSelected,
    toggleSelected,
    toggleSelectAll,
    setQuantity,
    removeItem,
    clearCart,
  } = useCart();

  // Resolve each cart entry against the book catalog. Drop unknown slugs.
  const resolved = items
    .map((entry) => {
      const book = getBookBySlug(entry.slug);
      if (!book) return null;
      return { entry, book };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Tri-state select-all: indeterminate when some-but-not-all selected.
  const selectAllIndeterminate = selectedCount > 0 && !allSelected;

  // Selected-only totals.
  const selectedResolved = resolved.filter((r) => r.entry.selected);
  const selectedQty = selectedResolved.reduce((s, r) => s + r.entry.quantity, 0);
  const subtotal = selectedResolved.reduce(
    (sum, r) => sum + r.book.price * r.entry.quantity,
    0,
  );
  const vat = selectedResolved.length > 0 ? Math.round(subtotal * VAT_RATE) : 0;
  const shipping = selectedResolved.length > 0 ? SHIPPING_FLAT : 0;
  const total = subtotal + vat + shipping;

  // Pre-hydration: render an empty shell to keep SSR/CSR HTML aligned.
  if (!hydrated) {
    return (
      <section className="section-pad-sm">
        <div className="container-site">
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card min-h-[40vh]" />
        </div>
      </section>
    );
  }

  // Truly empty cart.
  if (resolved.length === 0) {
    return (
      <section className="section-pad-sm">
        <div className="container-site">
          <EmptyState
            icon={<ShoppingBag size={36} />}
            title="আপনার কার্ট খালি"
            description="বই যোগ করতে নিচের বাটন চাপুন।"
            cta={
              <Button href="/products" variant="primary">
                বই দেখুন
              </Button>
            }
          />
        </div>
      </section>
    );
  }

  return (
    <section className="section-pad-sm">
      <div className="container-site space-y-6">
        {/* Figma 9:5261 — "Continue Shopping" back link, English label */}
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700 transition-colors"
        >
          <ChevronLeft size={16} /> Continue Shopping
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start min-w-0 [&>*]:min-w-0">
          {/* Cart list — Figma 9:5261: "Shopping Cart (N items)" English title,
              brand-coloured bag icon, Select All + Delete All toolbar. */}
          <div
            data-figma-id="cart.list-card"
            className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-default)]">
              <ShoppingBag size={22} className="text-brand-700" />
              <h1 className="text-h3 text-[var(--fg-primary)]">
                Shopping Cart ({toBengaliNumber(itemCount)} {itemCount === 1 ? "item" : "items"})
              </h1>
            </div>

            <div className="flex items-center justify-between py-4">
              <Checkbox
                label={
                  selectAllIndeterminate
                    ? `Select All (${toBengaliNumber(selectedCount)} / ${toBengaliNumber(itemCount)})`
                    : "Select All"
                }
                id="select-all"
                checked={allSelected}
                indeterminate={selectAllIndeterminate}
                onChange={toggleSelectAll}
              />
              <button
                type="button"
                onClick={clearCart}
                className="text-body-sm text-discount-600 hover:text-discount-700 font-semibold"
              >
                Delete All
              </button>
            </div>

            <div>
              {resolved.map(({ entry, book }) => {
                const rowItem: RowItem = {
                  id: book.slug,
                  titleBn: book.titleBn,
                  category: book.categoryLabel,
                  price: book.price * entry.quantity,
                  unitPrice: book.price,
                };
                return (
                  <CartItemRow
                    key={book.slug}
                    item={rowItem}
                    quantity={entry.quantity}
                    selected={entry.selected}
                    onToggleSelect={() => toggleSelected(book.slug)}
                    onQuantityChange={(q) => setQuantity(book.slug, q)}
                    onRemove={() => removeItem(book.slug)}
                  />
                );
              })}
            </div>
          </div>

          {/* Order summary */}
          <OrderSummaryCard
            itemCount={selectedQty}
            subtotal={subtotal}
            vat={vat}
            shipping={shipping}
            total={total}
            onAddMore={() => router.push("/products")}
            onCheckout={() => {
              if (selectedCount === 0) return;
              router.push("/checkout");
            }}
          />
        </div>
      </div>
    </section>
  );
}
