import booksData from "@/data/books.json";

export type BookStock = "in-stock" | "preorder" | "out-of-stock";
export type BookBadgeType = "discount" | "preorder" | "bestseller" | "stockout";

export interface BookBadge {
  type: BookBadgeType;
  label: string;
}

export interface Book {
  slug: string;
  title: string;
  titleBn: string;
  category: string;
  categoryLabel: string;
  description: string;
  descriptionBn: string;
  price: number;
  oldPrice?: number;
  currency: string;
  freeDelivery: boolean;
  stock: BookStock;
  badge: BookBadge | null;
  secondaryBadge?: BookBadge | null;
  author: string;
  pages: number;
  version: string;
  edition: string;
}

const books = booksData as Book[];

export function getAllBooks(): Book[] {
  return books;
}

export function getBookBySlug(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

export function getBooksByCategory(category: string): Book[] {
  if (category === "all") return books;
  return books.filter((b) => b.category === category);
}

export function getRelatedBooks(current: Book, limit = 4): Book[] {
  return books
    .filter((b) => b.category === current.category && b.slug !== current.slug)
    .slice(0, limit);
}

export function getPopularBooks(limit = 4): Book[] {
  return books
    .filter((b) => b.badge?.type === "discount" || b.badge?.type === "bestseller")
    .slice(0, limit);
}

export function getAcademicBooks(limit = 4): Book[] {
  return books.filter((b) => b.category === "academic").slice(0, limit);
}

export function getAdmissionBooks(limit = 4): Book[] {
  return books.filter((b) => b.category === "admission").slice(0, limit);
}
