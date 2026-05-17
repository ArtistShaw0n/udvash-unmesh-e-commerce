/**
 * Structured-data builders (schema.org JSON-LD).
 *
 * Used to inject `<script type="application/ld+json">` blocks via the
 * `<StructuredData>` server-component wrapper. Each builder returns a
 * plain object that gets `JSON.stringify`'d in the component.
 */

import type { Book } from "@/lib/books";
import { SITE_NAME_EN, SITE_NAME_BN } from "@/lib/site";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://udvash-unmesh-e-commerce.netlify.app";

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME_BN,
    alternateName: SITE_NAME_EN,
    url: SITE_URL,
    logo: `${SITE_URL}/udvash-logo.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+880-9666-775533",
      contactType: "customer support",
      areaServed: "BD",
      availableLanguage: ["bn", "en"],
    },
    sameAs: [
      "https://facebook.com/udvashunmesh",
      "https://youtube.com/@udvashunmesh",
    ],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME_BN,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productLd(book: Book) {
  const url = `${SITE_URL}/products/${book.slug}`;
  const availability =
    book.stock === "in-stock"
      ? "https://schema.org/InStock"
      : book.stock === "preorder"
      ? "https://schema.org/PreOrder"
      : "https://schema.org/OutOfStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: book.title,
    alternateName: book.titleBn,
    description: book.description || book.descriptionBn,
    sku: book.slug,
    brand: {
      "@type": "Brand",
      name: SITE_NAME_BN,
    },
    author: {
      "@type": "Person",
      name: book.author,
    },
    numberOfPages: book.pages,
    bookEdition: book.edition,
    inLanguage: "bn",
    image: `${SITE_URL}/udvash-logo.svg`, // TODO: replace with real product photo
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: book.currency || "BDT",
      price: book.price.toString(),
      ...(book.oldPrice && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: book.oldPrice.toString(),
          priceCurrency: book.currency || "BDT",
          referenceQuantity: { "@type": "QuantitativeValue", value: 1 },
        },
      }),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME_BN },
    },
  };
}

export function breadcrumbLd(items: Array<{ name: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.href}`,
    })),
  };
}

export function faqLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
      },
    })),
  };
}
