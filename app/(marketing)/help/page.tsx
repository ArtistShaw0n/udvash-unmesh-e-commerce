import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StaticPageLayout } from "@/components/organisms";

export const metadata = { title: "হেল্প সেন্টার" };

const FAQS = [
  { q: "ডেলিভারি কতদিনে পৌঁছাবে?", a: "ঢাকার ভেতরে ২-৩ কর্মদিবস, বাইরে ৩-৫ কর্মদিবস।" },
  { q: "কোন কোন পেমেন্ট মেথড আছে?", a: "bKash, Nagad, Rocket, Card, এবং Cash on Delivery।" },
  { q: "অর্ডার ক্যান্সেল করা যাবে?", a: "অর্ডার Shipped হওয়ার আগে যেকোনো সময় ক্যান্সেল করা যাবে — আমার অর্ডার পেজ থেকে।" },
  { q: "রিটার্ন কিভাবে করবো?", a: "ডেলিভারির ৭ দিনের মধ্যে রিটার্ন করা যাবে। বিস্তারিত রিটার্ন ও রিফান্ড পেজে।" },
  { q: "Bulk অর্ডার (১০+ বই) এ ডিসকাউন্ট আছে?", a: "হ্যাঁ — support@udvash-unmesh.com এ যোগাযোগ করুন।" },
];

const QUICK_LINKS = [
  { label: "অর্ডার ট্র্যাক করুন", href: "/orders/track" },
  { label: "রিটার্ন ও রিফান্ড", href: "/return-refund" },
  { label: "পেমেন্ট পদ্ধতি", href: "/payment" },
  { label: "যোগাযোগ", href: "/contact" },
];

export default function HelpPage() {
  return (
    <StaticPageLayout
      title="হেল্প সেন্টার"
      description="প্রায়শই জিজ্ঞাসিত প্রশ্ন ও দ্রুত সাহায্যের লিংক।"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "হেল্প সেন্টার" }]}
    >
      <h2 className="text-h3 text-[var(--fg-primary)]">দ্রুত লিংকস</h2>
      <div className="not-prose grid sm:grid-cols-2 gap-3 mt-3">
        {QUICK_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center justify-between gap-2 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-body-sm font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors"
          >
            {l.label}
            <ChevronRight size={16} className="text-[var(--fg-muted)]" />
          </Link>
        ))}
      </div>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">FAQ</h2>
      <div className="not-prose space-y-2">
        {FAQS.map((f, i) => (
          <details key={i} className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 group">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-2 text-body font-semibold text-[var(--fg-primary)]">
              {f.q}
              <ChevronRight size={16} className="text-[var(--fg-muted)] group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-3 text-body-sm text-[var(--fg-secondary)]">{f.a}</p>
          </details>
        ))}
      </div>
    </StaticPageLayout>
  );
}
