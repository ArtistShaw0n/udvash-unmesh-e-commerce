import { Heart } from "lucide-react";
import { Button } from "@/components/atoms";
import { EmptyState, ProductCard } from "@/components/molecules";
import { getAllBooks } from "@/lib/books";

export const metadata = { title: "উইশলিস্ট" };

export default function WishlistPage() {
  // For demo: show first 3 books from data; swap with empty array to see EmptyState.
  const items = getAllBooks().slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 text-[var(--fg-primary)]">উইশলিস্ট</h1>
        <p className="text-body text-[var(--fg-secondary)] mt-1">আপনার পছন্দের বইসমূহ।</p>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => <ProductCard key={b.slug} book={b} />)}
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
