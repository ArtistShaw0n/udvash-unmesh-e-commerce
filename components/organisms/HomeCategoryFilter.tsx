"use client";

import { useRouter } from "next/navigation";
import { CategoryFilterSection } from "./CategoryFilterSection";

export interface HomeCategoryFilterProps {
  title: string;
  subtitle?: string;
  categories: { slug: string; label: string }[];
  className?: string;
}

/**
 * HomeCategoryFilter — thin client wrapper around CategoryFilterSection
 * that actually does something when the user clicks a pill.
 *
 * On the home page, clicking a category should navigate to /products
 * pre-filtered by that category (or /products with no query for "all").
 * The bare `CategoryFilterSection` doesn't know about routing, so we
 * hand it an onChange that calls `router.push`.
 */
export function HomeCategoryFilter({
  title,
  subtitle,
  categories,
  className,
}: HomeCategoryFilterProps) {
  const router = useRouter();
  return (
    <CategoryFilterSection
      title={title}
      subtitle={subtitle}
      categories={categories}
      defaultCategory="all"
      onChange={(slug) => {
        router.push(slug === "all" ? "/products" : `/products?category=${slug}`);
      }}
      className={className}
    />
  );
}
