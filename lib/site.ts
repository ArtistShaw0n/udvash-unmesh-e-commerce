/** Site-wide constants */

export const SITE_NAME_BN = "উদ্ভাস-উন্মেষ";
export const SITE_NAME_EN = "Udvash-Unmesh";
export const SITE_TAGLINE_BN =
  "আপনার মেধা বিকাশে এবং শিক্ষাসামগ্রী সরবরাহে আমরা সর্বদা প্রতিশ্রুতিবদ্ধ।";

export const SITE_PHONE = "09666-775533";
export const SITE_PHONE_BN = "০৯৬৬৬-৭৭৫৫৩৩";
export const SITE_EMAIL = "support@udvash-unmesh.com";
export const SITE_ADDRESS_BN = "হাউজ ৭১, রোড ৪, ব্লক সি, বনশ্রী, ঢাকা ১২১৯";

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
