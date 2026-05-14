import type { Metadata } from "next";
import { getAllBooks } from "@/lib/books";
import { ProductsBrowser } from "./_browser";

export const metadata: Metadata = {
  title: "সকল বই",
  description: "একাডেমিক, এডমিশন, মডেল টেস্ট, ক্যাডেট ও বৃত্তি প্রস্তুতির সব বই এক জায়গায়।",
};

export default function ProductsPage() {
  const books = getAllBooks();
  return <ProductsBrowser books={books} />;
}
