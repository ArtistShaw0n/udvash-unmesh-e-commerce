import { describe, expect, it } from "vitest";
import {
  breadcrumbLd,
  faqLd,
  organizationLd,
  productLd,
  websiteLd,
} from "@/lib/structured-data";
import type { Book } from "@/lib/books";

const sampleBook: Book = {
  slug: "test-book",
  title: "Test Book",
  titleBn: "টেস্ট বই",
  category: "academic",
  categoryLabel: "Academic",
  description: "A test product",
  descriptionBn: "একটি টেস্ট বই",
  price: 500,
  oldPrice: 700,
  currency: "BDT",
  freeDelivery: true,
  stock: "in-stock",
  badge: null,
  author: "Test Author",
  pages: 100,
  version: "1.0",
  edition: "2026",
};

describe("structured-data builders", () => {
  it("organizationLd has required @type", () => {
    const o = organizationLd();
    expect(o["@type"]).toBe("Organization");
    expect(o.url).toMatch(/^https?:\/\//);
  });

  it("websiteLd includes a SearchAction", () => {
    const w = websiteLd();
    expect(w["@type"]).toBe("WebSite");
    expect((w as any).potentialAction["@type"]).toBe("SearchAction");
  });

  it("productLd reflects price + availability + offers", () => {
    const p = productLd(sampleBook);
    expect(p["@type"]).toBe("Product");
    expect((p as any).offers.price).toBe("500");
    expect((p as any).offers.availability).toBe("https://schema.org/InStock");
  });

  it("productLd maps preorder availability", () => {
    const p = productLd({ ...sampleBook, stock: "preorder" });
    expect((p as any).offers.availability).toBe("https://schema.org/PreOrder");
  });

  it("breadcrumbLd serializes positions correctly", () => {
    const b = breadcrumbLd([
      { name: "Home", href: "/" },
      { name: "Books", href: "/products" },
    ]);
    const items = (b as any).itemListElement;
    expect(items).toHaveLength(2);
    expect(items[0].position).toBe(1);
    expect(items[1].position).toBe(2);
  });

  it("faqLd has Question + Answer pairs", () => {
    const f = faqLd([{ q: "Hi?", a: "Hello." }]);
    expect((f as any).mainEntity[0]["@type"]).toBe("Question");
    expect((f as any).mainEntity[0].acceptedAnswer.text).toBe("Hello.");
  });
});
