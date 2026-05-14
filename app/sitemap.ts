import type { MetadataRoute } from "next";
import { getAllBooks } from "@/lib/books";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://udvash-unmesh.netlify.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const bookPages: MetadataRoute.Sitemap = getAllBooks().map((b) => ({
    url: `${SITE_URL}/products/${b.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...bookPages];
}
