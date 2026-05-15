import type { Metadata } from "next";
import { getAllBooks } from "@/lib/books";
import { SearchClient } from "./_search";

export const metadata: Metadata = {
  title: "Search",
  description: "যেকোনো বই, খাতা ও অন্যান্য খুঁজুন।",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  return <SearchClient books={getAllBooks()} initialQ={q} />;
}
