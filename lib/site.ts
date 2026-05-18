/** Site-wide constants */

/**
 * Canonical site URL — used by metadataBase, sitemap, robots, JSON-LD,
 * and OG image generators. Set NEXT_PUBLIC_SITE_URL in your env to
 * override (Vercel auto-injects it on production deploys). The default
 * points to the live Vercel host so SEO + canonical tags work even if
 * the env var is missing.
 *
 * Social handles below are read by `organizationLd()` to populate the
 * structured-data `sameAs` array, and by Footer to wire its social
 * icons.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://udvash-unmesh-e-commerce.vercel.app";

export const SITE_SOCIAL = {
  facebook: "https://facebook.com/udvashunmesh",
  instagram: "https://instagram.com/udvashunmesh",
  youtube: "https://youtube.com/@udvashunmesh",
  linkedin: "https://linkedin.com/company/udvashunmesh",
} as const;

export const SITE_NAME_BN = "উদ্ভাস-উন্মেষ";
export const SITE_NAME_EN = "Udvash-Unmesh";
export const SITE_TAGLINE_BN =
  "আপনার মেধা বিকাশে এবং শিক্ষাসামগ্রী সরবরাহে আমরা সর্বদা প্রতিশ্রুতিবদ্ধ।";

export const SITE_PHONE = "09666-775533";
export const SITE_PHONE_BN = "০৯৬৬৬-৭৭৫৫৩৩";
export const SITE_EMAIL = "support@udvash-unmesh.com";
export const SITE_ADDRESS_BN = "হাউজ ৭১, রোড ৪, ব্লক সি, বনশ্রী, ঢাকা ১২১৯";

/**
 * WhatsApp contact number used by the floating WhatsApp FAB. Read from
 * NEXT_PUBLIC_WHATSAPP_NUMBER so the production deploy can override
 * without a code change. Default falls back to a placeholder support
 * line for dev builds.
 */
export const SITE_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+8801798214677";

export const CATEGORIES = [
  { slug: "all", label: "সব" },
  { slug: "academic", label: "একাডেমিক" },
  { slug: "model-test", label: "মডেল টেস্ট" },
  { slug: "admission", label: "এডমিশন" },
  { slug: "scholarship", label: "বৃত্তি" },
  { slug: "cadet", label: "ক্যাডেট" },
  { slug: "college-admission", label: "কলেজ ভর্তি" },
] as const;

/** Bengali numeral mapping helpers */
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliNumber(value: number | string): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function formatBdtBn(amount: number): string {
  return `${toBengaliNumber(amount.toLocaleString("en-US"))}৳`;
}
