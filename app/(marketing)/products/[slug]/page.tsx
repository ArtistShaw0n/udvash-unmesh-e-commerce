import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  ProductDetailHero,
} from "@/components/organisms";
import { StructuredData } from "@/components/atoms";
import { getAllBooks, getBookBySlug } from "@/lib/books";
import { productLd, breadcrumbLd } from "@/lib/structured-data";

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

  return (
    <>
      <StructuredData
        data={[
          productLd(book),
          breadcrumbLd([
            { name: "হোম", href: "/" },
            { name: "বই", href: "/products" },
            { name: book.categoryLabel, href: `/products?category=${book.category}` },
            { name: book.title, href: `/products/${book.slug}` },
          ]),
        ]}
      />
      <div className="container-site pt-6 pb-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-body-sm text-[var(--fg-secondary)] hover:text-brand-700 transition-colors"
        >
          <ChevronLeft size={16} /> Continue Shopping
        </Link>
      </div>

      <ProductDetailHero book={book} offerEndsAt={OFFER_END} />

      {/* Reviews + Related + Recently Viewed sections lived here
          previously. Removed to match Figma node 9:4771, which only
          shows the hero card. Each is a real e-commerce retention
          surface — bring them back per a future product decision,
          ideally below an explicit "More on this book" header so the
          design intent is clear. The components themselves
          (ReviewsSection, ProductGridSection, RecentlyViewedSection)
          are still exported from components/organisms and ready to
          drop back in. */}
    </>
  );
}
