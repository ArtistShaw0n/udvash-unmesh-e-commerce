import {
  FlashSaleBanner,
  HeroBanner,
  HomeCategoryFilter,
  ProductGridSection,
} from "@/components/organisms";
import {
  getAcademicBooks,
  getAdmissionBooks,
  getAllBooks,
  getPopularBooks,
} from "@/lib/books";
import { CATEGORIES } from "@/lib/site";

// Computed once at module load (pure render).
const FLASH_SALE_END = new Date(Date.now() + 24 * 60 * 60 * 1000);

export default function HomePage() {
  const popular = getPopularBooks(4);
  const academic = getAcademicBooks(4);
  const admission = getAdmissionBooks(4);
  // Fallback if a section is short — repeat from all-books
  const allBooks = getAllBooks();
  const fill = (arr: ReturnType<typeof getAllBooks>, count: number) =>
    arr.length >= count ? arr.slice(0, count) : [...arr, ...allBooks.slice(0, count - arr.length)];

  return (
    <>
      <HeroBanner
        badge="নতুন এডিশন ২০২৬"
        title="HSC প্যারালাল টেক্সট এখন আরও গোছানো"
        description="পদার্থবিজ্ঞান, রসায়ন, গণিত ও জীববিজ্ঞানের সম্পূর্ণ প্রস্তুতি এক সেটেই — প্রি-অর্ডার করলেই পাচ্ছেন বিশেষ ছাড় এবং ফ্রি ডেলিভারি।"
        primaryCta={{ label: "Buy Now", href: "/products" }}
        secondaryCta={{ label: "বিস্তারিত দেখুন", href: "/products" }}
        imageSrc="/hero/book.png"
        imageAlt="ষষ্ঠ শ্রেণি প্যারালাল টেক্সট — বাংলা ১ম পত্র"
      />

      <HomeCategoryFilter
        title="বই খুঁজুন"
        subtitle="একাডেমিক থেকে শুরু করে বিভিন্ন ধরনের বই পাবেন এখানে"
        categories={[...CATEGORIES]}
      />

      <ProductGridSection
        title="জনপ্রিয় বই"
        subtitle="Academic সেক্টরের জনপ্রিয় বিভিন্ন বইসমূহ"
        seeAllHref="/products"
        books={fill(popular, 4)}
        tone="muted"
        figmaNodeId="9:5434"
      />

      <FlashSaleBanner
        title="Flash Sale"
        subtitle="Up to 40% off on selected items"
        cta={{ label: "Up to 40% OFF", href: "/products" }}
        targetDate={FLASH_SALE_END}
      />

      <ProductGridSection
        title="একাডেমিক বই"
        subtitle="Academic সেক্টরের জনপ্রিয় বিভিন্ন বইসমূহ"
        seeAllHref="/products?category=academic"
        books={fill(academic, 4)}
        tone="muted"
        figmaNodeId="9:5601"
      />

      <ProductGridSection
        title="এডমিশন বই"
        subtitle="ভর্তি পরীক্ষার জন্য নির্বাচিত বইসমূহ"
        seeAllHref="/products?category=admission"
        books={fill(admission, 4)}
        tone="muted"
        figmaNodeId="9:5742"
      />
    </>
  );
}
