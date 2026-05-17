import { BookOpen, Heart, ShieldCheck, Truck } from "lucide-react";
import { StaticPageLayout } from "@/components/organisms";

export const metadata = {
  title: "আমাদের সম্পর্কে",
  description:
    "উদ্ভাস-উন্মেষের গল্প — বাংলাদেশের শিক্ষার্থীদের জন্য মানসম্পন্ন একাডেমিক বই ও প্রস্তুতি সামগ্রী।",
};

const VALUES = [
  {
    icon: <ShieldCheck size={20} />,
    title: "স্বচ্ছ মূল্য",
    body: "প্রতিটি বইয়ের দাম, ভ্যাট, শিপিং চার্জ — সব আগে থেকেই পরিষ্কার। কোনো লুকানো চার্জ নেই।",
  },
  {
    icon: <BookOpen size={20} />,
    title: "মানসম্মত সামগ্রী",
    body: "সরাসরি প্রকাশক ও লেখকদের সাথে কাজ — অরিজিনাল বই, সর্বশেষ সংস্করণ।",
  },
  {
    icon: <Truck size={20} />,
    title: "দ্রুত ডেলিভারি",
    body: "ঢাকার ভেতরে ২-৩ দিন, বাইরে ৩-৫ দিন। ১০০০৳+ অর্ডারে ফ্রি ডেলিভারি।",
  },
  {
    icon: <Heart size={20} />,
    title: "কাস্টমার-ফার্স্ট সাপোর্ট",
    body: "২৪ ঘণ্টার মধ্যে রেসপন্স। ৭ দিনের সহজ রিটার্ন। কোন প্রশ্ন ছাড়াই।",
  },
];

export default function AboutPage() {
  return (
    <StaticPageLayout
      title="আমাদের সম্পর্কে"
      description="শিক্ষার্থীদের পাশে দাঁড়ানোর গল্প।"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "আমাদের সম্পর্কে" }]}
    >
      <h2 className="text-h3 text-[var(--fg-primary)]">আমাদের যাত্রা</h2>
      <p>
        উদ্ভাস-উন্মেষ একটি দীর্ঘদিনের শিক্ষা প্রতিষ্ঠান, যা বাংলাদেশের লক্ষ লক্ষ
        শিক্ষার্থীকে স্কুল, কলেজ ও বিশ্ববিদ্যালয় ভর্তি প্রস্তুতিতে সাহায্য করে আসছে। আমাদের
        একাডেমিক বইগুলো প্রজন্মের পর প্রজন্ম শিক্ষার্থীদের ভরসার নাম হয়ে উঠেছে।
      </p>
      <p>
        এই অনলাইন বুকশপ চালু করার উদ্দেশ্য — সারা দেশের শিক্ষার্থীদের ঘরে বসেই আমাদের
        প্রকাশনা পৌঁছে দেওয়া। ঢাকা, চট্টগ্রাম, রাজশাহী থেকে শুরু করে দেশের প্রত্যন্ত
        জেলা পর্যন্ত — যেখানেই আপনি, আমরা সেখানেই।
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">আমরা যা প্রকাশ করি</h2>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>HSC প্যারালাল টেক্সট</strong> — পদার্থ, রসায়ন, গণিত, জীববিজ্ঞান সহ সব বিষয়ের</li>
        <li><strong>এডমিশন প্রস্তুতি</strong> — মেডিকেল, ইঞ্জিনিয়ারিং, ঢাবি ভর্তি প্রশ্নব্যাংক</li>
        <li><strong>মডেল টেস্ট</strong> — প্রতিটি অধ্যায়ের সমাধান সহ</li>
        <li><strong>ক্যাডেট কলেজ প্রস্তুতি</strong> — ৬ষ্ঠ ও ৯ম শ্রেণির ভর্তি</li>
        <li><strong>প্রাথমিক বৃত্তি</strong> — পঞ্চম শ্রেণির বৃত্তি পরীক্ষার পূর্ণাঙ্গ গাইড</li>
        <li><strong>HSC বাংলা ও ইংরেজি</strong> — গ্রামার, কম্পোজিশন, সাহিত্য</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">কেন আমাদের বেছে নেবেন</h2>
      <div className="not-prose grid sm:grid-cols-2 gap-4 mt-3">
        {VALUES.map((v) => (
          <div
            key={v.title}
            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5"
          >
            <span className="inline-flex w-10 h-10 items-center justify-center rounded-md bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">
              {v.icon}
            </span>
            <p className="text-body font-semibold text-[var(--fg-primary)] mt-3">
              {v.title}
            </p>
            <p className="text-body-sm text-[var(--fg-secondary)] mt-1 leading-relaxed">
              {v.body}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">আমাদের লক্ষ্য</h2>
      <blockquote className="border-l-4 border-brand-500 pl-4 italic text-[var(--fg-secondary)]">
        "শিক্ষা হোক সহজলভ্য — যেখানেই হোন, যা-ই হোক বাজেট। প্রতিটি শিক্ষার্থীর হাতে
        মানসম্পন্ন প্রস্তুতির সামগ্রী পৌঁছে দেওয়া — এটাই আমাদের লক্ষ্য।"
      </blockquote>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">যোগাযোগ</h2>
      <p>
        কোনো প্রশ্ন থাকলে আমাদের{" "}
        <a className="font-semibold underline" href="/contact">যোগাযোগ পেজে</a> ফোন,
        ইমেইল, ও WhatsApp নম্বর পাবেন। আমাদের প্রতিনিধি ২৪ ঘণ্টার মধ্যে রেসপন্স করেন।
      </p>
    </StaticPageLayout>
  );
}
