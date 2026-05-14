"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { Checkbox } from "@/components/atoms";
import { CartItemRow, OrderSummaryCard, type CartItem } from "@/components/molecules";

const INITIAL_ITEMS: (CartItem & { quantity: number; selected: boolean })[] = [
  { id: "1", titleBn: "এইচএসসি রসায়ন ২য় পত্র", category: "Academic", price: 2250, unitPrice: 9890, quantity: 1, selected: true },
  { id: "2", titleBn: "এইচএসসি রসায়ন ২য় পত্র", category: "Academic", price: 2250, unitPrice: 9890, quantity: 1, selected: false },
  { id: "3", titleBn: "এইচএসসি রসায়ন ২য় পত্র", category: "Academic", price: 2250, unitPrice: 9890, quantity: 1, selected: false },
  { id: "4", titleBn: "এইচএসসি রসায়ন ২য় পত্র", category: "Academic", price: 2250, unitPrice: 9890, quantity: 1, selected: false },
];

export function CartPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const selectedCount = items.filter((i) => i.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  function toggleAll() {
    setItems((prev) => prev.map((i) => ({ ...i, selected: !allSelected })));
  }
  function toggleItem(id: string) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, selected: !i.selected } : i));
  }
  function setQty(id: string, q: number) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: q } : i));
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }
  function deleteAll() {
    setItems([]);
  }

  const subtotal = items.filter((i) => i.selected).reduce((sum, i) => sum + i.price * Math.max(1, i.quantity), 0);
  const vat = 250;
  const shipping = 50;
  const total = subtotal;

  return (
    <section className="section-pad-sm">
      <div className="container-site space-y-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700 transition-colors"
        >
          <ChevronLeft size={16} /> Continue Shopping
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Cart list */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-default)]">
              <ShoppingBag size={22} className="text-brand-700" />
              <h1 className="text-h3 text-[var(--fg-primary)]">
                Shopping Cart ({selectedCount} {selectedCount === 1 ? "item" : "items"})
              </h1>
            </div>

            {items.length > 0 ? (
              <>
                <div className="flex items-center justify-between py-4">
                  <Checkbox label="Select All" id="select-all" checked={allSelected} onChange={toggleAll} />
                  <button
                    type="button"
                    onClick={deleteAll}
                    className="text-body-sm text-discount-600 hover:text-discount-700 font-semibold"
                  >
                    Delete All
                  </button>
                </div>

                <div>
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      quantity={item.quantity}
                      selected={item.selected}
                      onToggleSelect={() => toggleItem(item.id)}
                      onQuantityChange={(q) => setQty(item.id, q)}
                      onRemove={() => remove(item.id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-body text-[var(--fg-muted)]">আপনার কার্ট খালি।</p>
              </div>
            )}
          </div>

          {/* Order summary */}
          {items.length > 0 && (
            <OrderSummaryCard
              itemCount={selectedCount}
              subtotal={subtotal}
              vat={vat}
              shipping={shipping}
              total={total}
            />
          )}
        </div>
      </div>
    </section>
  );
}
