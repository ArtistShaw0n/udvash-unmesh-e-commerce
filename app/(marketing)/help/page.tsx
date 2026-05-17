import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StaticPageLayout } from "@/components/organisms";
import { StructuredData } from "@/components/atoms";
import { faqLd } from "@/lib/structured-data";

export const metadata = {
  title: "হেল্প সেন্টার",
  description:
    "অর্ডার, ডেলিভারি, পেমেন্ট, রিটার্ন — সব প্রশ্নের উত্তর এক জায়গায়।",
};

const FAQ_GROUPS: Array<{
  title: string;
  items: Array<{ q: string; a: string }>;
}> = [
  {
    title: "অর্ডার",
    items: [
      {
        q: "অর্ডার করতে কি একাউন্ট লাগবে?",
        a: "হ্যাঁ। দ্রুত চেকআউট, অর্ডার হিস্ট্রি, ও সাপোর্টের জন্য একাউন্ট প্রয়োজন। ইমেইল + ৬ অক্ষরের পাসওয়ার্ড দিয়ে ৩০ সেকেন্ডে একাউন্ট তৈরি হয়।",
      },
      {
        q: "অর্ডার ক্যান্সেল করতে পারব?",
        a: "অর্ডার Shipped হওয়ার আগে যেকোনো সময় ক্যান্সেল করা যাবে। 'আমার অর্ডার' পেজে গিয়ে সংশ্লিষ্ট অর্ডারে 'Cancel' বাটনে ক্লিক করুন।",
      },
      {
        q: "একই অর্ডারে একাধিক বই কিভাবে অর্ডার করব?",
        a: "যত খুশি বই কার্টে যোগ করুন। চেকআউট সময় সব এক সাথে অর্ডার হবে। শিপিং চার্জ সব মিলিয়ে একবারই।",
      },
      {
        q: "অর্ডার দিলাম কিন্তু কনফার্মেশন ইমেইল পাইনি",
        a: "স্প্যাম ফোল্ডার চেক করুন। তারপরও না থাকলে support@udvash-unmesh.com এ অর্ডার আইডি সহ যোগাযোগ করুন।",
      },
    ],
  },
  {
    title: "ডেলিভারি",
    items: [
      {
        q: "ডেলিভারি কতদিনে পৌঁছাবে?",
        a: "ঢাকার ভেতরে ২-৩ কর্মদিবস, ঢাকার বাইরে ৩-৫ কর্মদিবস। দূরবর্তী এলাকায় ৭ দিন পর্যন্ত লাগতে পারে।",
      },
      {
        q: "শিপিং চার্জ কত?",
        a: "ফ্ল্যাট ৳৫০ — পুরো বাংলাদেশে। ১০০০৳+ অর্ডারে FREESHIP কুপন প্রয়োগ করলে ফ্রি।",
      },
      {
        q: "ডেলিভারি কোম্পানি কারা?",
        a: "Pathao, Sundarban Courier, RedX, এবং Steadfast — অঞ্চল অনুযায়ী।",
      },
      {
        q: "আমি বাসায় না থাকলে কী হবে?",
        a: "কুরিয়ার ৩ বার চেষ্টা করবে। প্রতিবার আপনাকে ফোন করবে। ৩ বার ব্যর্থ হলে অর্ডার বাতিল হয়ে রিফান্ড হয়।",
      },
    ],
  },
  {
    title: "পেমেন্ট",
    items: [
      {
        q: "কোন কোন পেমেন্ট মেথড আছে?",
        a: "bKash, Nagad, Rocket, Credit/Debit Card, এবং Cash on Delivery (COD)।",
      },
      {
        q: "COD এ কি বাড়তি চার্জ?",
        a: "না। COD-তেও শিপিং চার্জ একই ৳৫০। কোনো অতিরিক্ত cash-handling fee নেই।",
      },
      {
        q: "পেমেন্ট fail হয়েছে, কী করব?",
        a: "টাকা কেটে গেলেও অর্ডার দেখা না গেলে — ৩০ মিনিট অপেক্ষা করুন (gateway রিকনসিল করে)। তারপরও না দেখালে support@udvash-unmesh.com এ ট্রানজেকশন আইডি সহ মেইল করুন।",
      },
    ],
  },
  {
    title: "রিটার্ন ও রিফান্ড",
    items: [
      {
        q: "রিটার্ন কিভাবে করব?",
        a: "ডেলিভারির ৭ দিনের মধ্যে 'আমার অর্ডার' পেজ থেকে 'Return Request' করুন। আমরা পিকআপ করব।",
      },
      {
        q: "রিফান্ডে কত সময় লাগে?",
        a: "bKash/Nagad: ৩-৫ দিন। Card: ৫-৭ দিন। COD হলে আপনার বিকাশ/ব্যাংক নম্বরে।",
      },
      {
        q: "আমি ভুল বই পেয়েছি",
        a: "পিকআপ চার্জ আমাদের। নতুন বই বিনামূল্যে পাঠানো হবে।",
      },
    ],
  },
  {
    title: "একাউন্ট",
    items: [
      {
        q: "পাসওয়ার্ড ভুলে গেছি",
        a: "/forgot-password পেজে ইমেইল দিন। রিসেট কোড ইমেইলে পাঠানো হবে।",
      },
      {
        q: "ইমেইল পরিবর্তন করতে পারব?",
        a: "সিকিউরিটির কারণে ইমেইল পরিবর্তন আপাতত শুধু সাপোর্টের মাধ্যমে — privacy@udvash-unmesh.com এ মেইল করুন।",
      },
      {
        q: "একাউন্ট ডিলিট কিভাবে করব?",
        a: "একাউন্ট সেটিংস থেকে অথবা privacy@udvash-unmesh.com এ অনুরোধ পাঠান। ৩০ দিনের মধ্যে স্থায়ীভাবে মুছে ফেলা হবে।",
      },
    ],
  },
  {
    title: "অন্যান্য",
    items: [
      {
        q: "Bulk অর্ডার (১০+ বই) এ ডিসকাউন্ট আছে?",
        a: "হ্যাঁ। ১০+ বই কিনলে বিশেষ ছাড় পাওয়া যাবে। support@udvash-unmesh.com এ বিস্তারিত যোগাযোগ করুন।",
      },
      {
        q: "স্কুল / কোচিং সেন্টারের জন্য বিশেষ মূল্য আছে?",
        a: "হ্যাঁ। B2B মূল্যের জন্য sales@udvash-unmesh.com এ যোগাযোগ করুন।",
      },
      {
        q: "ই-বুক / ডিজিটাল কপি আছে?",
        a: "বর্তমানে নেই। ভবিষ্যতে যোগ করার পরিকল্পনা আছে।",
      },
    ],
  },
];

const QUICK_LINKS = [
  { label: "অর্ডার ট্র্যাক করুন", href: "/orders/track" },
  { label: "রিটার্ন ও রিফান্ড", href: "/return-refund" },
  { label: "পেমেন্ট পদ্ধতি", href: "/payment" },
  { label: "যোগাযোগ", href: "/contact" },
];

export default function HelpPage() {
  const allFaq = FAQ_GROUPS.flatMap((g) => g.items);
  return (
    <>
      <StructuredData data={faqLd(allFaq)} />
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

        {FAQ_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="text-h3 text-[var(--fg-primary)] pt-6">{group.title}</h2>
            <div className="not-prose space-y-2 mt-3">
              {group.items.map((f, i) => (
                <details
                  key={i}
                  className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 group"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-2 text-body font-semibold text-[var(--fg-primary)]">
                    {f.q}
                    <ChevronRight
                      size={16}
                      className="text-[var(--fg-muted)] group-open:rotate-90 transition-transform"
                    />
                  </summary>
                  <p className="mt-3 text-body-sm text-[var(--fg-secondary)] leading-relaxed">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="not-prose mt-8 p-5 rounded-md bg-brand-50 dark:bg-brand-700/15 border border-brand-100 dark:border-brand-700/30">
          <p className="text-body font-semibold text-[var(--fg-primary)]">
            উত্তর পেলেন না?
          </p>
          <p className="text-body-sm text-[var(--fg-secondary)] mt-1">
            ফোন:{" "}
            <a className="font-semibold underline" href="tel:09666775533">
              ০৯৬৬৬-৭৭৫৫৩৩
            </a>
            {" · "}ইমেইল:{" "}
            <a className="font-semibold underline" href="mailto:support@udvash-unmesh.com">
              support@udvash-unmesh.com
            </a>
            {" · "}সকাল ৯টা — রাত ৯টা।
          </p>
        </div>
      </StaticPageLayout>
    </>
  );
}
