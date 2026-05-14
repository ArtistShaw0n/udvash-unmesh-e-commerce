import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductDetailHero, ProductGridSection } from "@/components/organisms";
import { getAllBooks, getBookBySlug, getRelatedBooks } from "@/lib/books";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const OFFER_END = new Date(Date.now() + 2 * 60 * 60 * 1000 + 34 * 60 * 1000 + 12 * 1000);

export async function generateStaticParams() {
  return getAllBooks().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) return { title: "Book not found" };
  return {
    title: book.title,
    description: book.description,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) notFound();

  const related = getRelatedBooks(book, 4);

  return (
    <>
      <div className="container-site pt-6 pb-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700 transition-colors"
        >
          <ChevronLeft size={16} /> Continue Shopping
        </Link>
      </div>

      <ProductDetailHero book={book} offerEndsAt={OFFER_END} />

      {related.length > 0 && (
        <ProductGridSection
          title="সম্পর্কিত বই"
          subtitle="এই ক্যাটেগরির অন্যান্য বইসমূহ"
          seeAllHref={`/products?category=${book.category}`}
          books={related}
          tone="muted"
        />
      )}
    </>
  );
}
