import { StaticPageLayout } from "@/components/organisms";

export const metadata = { title: "আমাদের সম্পর্কে" };

export default function AboutPage() {
  return (
    <StaticPageLayout
      title="আমাদের সম্পর্কে"
      description="উদ্ভাস-উন্মেষ — আপনার মেধা বিকাশে এবং শিক্ষাসামগ্রী সরবরাহে আমরা সর্বদা প্রতিশ্রুতিবদ্ধ।"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "আমাদের সম্পর্কে" }]}
    >
      <h2 className="text-h3 text-[var(--fg-primary)]">আমাদের লক্ষ্য</h2>
      <p>
        উদ্ভাস-উন্মেষ ২০XX সালে যাত্রা শুরু করে — শিক্ষার্থীদের জন্য মানসম্পন্ন একাডেমিক বই এবং
        প্রস্তুতিমূলক সামগ্রী সাশ্রয়ী মূল্যে পৌঁছে দেওয়াই আমাদের প্রধান লক্ষ্য। [TODO replace verbatim]
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">আমরা কি করি</h2>
      <p>
        একাডেমিক, ভর্তি প্রস্তুতি, মডেল টেস্ট, ক্যাডেট কলেজ ও বৃত্তির বই — সবকিছু এক প্ল্যাটফর্মে।
        ফ্রি ডেলিভারি, ৭ দিনের রিটার্ন পলিসি, এবং ২৪ ঘণ্টার মধ্যে কাস্টমার সাপোর্ট। [TODO replace verbatim]
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">আমাদের মূল্যবোধ</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>স্বচ্ছ মূল্য, কোনো লুকানো চার্জ নেই</li>
        <li>সরাসরি প্রকাশক ও লেখকদের সাথে যোগাযোগ</li>
        <li>সব বইয়ের গুণমান নিজে যাচাই করি</li>
      </ul>
    </StaticPageLayout>
  );
}
