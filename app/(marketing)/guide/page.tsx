import { StaticPageLayout } from "@/components/organisms";

export const metadata = { title: "ব্যবহারকারী নির্দেশিকা" };

export default function GuidePage() {
  return (
    <StaticPageLayout
      title="ব্যবহারকারী নির্দেশিকা"
      description="প্রথমবার কেনাকাটা করছেন? নিচের ধাপগুলো অনুসরণ করুন।"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "ব্যবহারকারী নির্দেশিকা" }]}
    >
      <h2 className="text-h3 text-[var(--fg-primary)]">১. একাউন্ট তৈরি</h2>
      <p>নাম, ইমেইল ও ফোন নম্বর দিয়ে দ্রুত একাউন্ট তৈরি করুন। গুগল/ফেসবুক দিয়েও সাইন আপ করা যায়।</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">২. বই খুঁজুন</h2>
      <p>উপরের সার্চ বার অথবা ক্যাটেগরি ফিল্টার দিয়ে আপনার দরকারি বই খুঁজে নিন।</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">৩. কার্টে যোগ করুন</h2>
      <p>বইয়ের পাশে &quot;Buy Now&quot; বা কার্ট আইকনে ক্লিক করে কার্টে যোগ করুন।</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">৪. চেকআউট</h2>
      <p>কার্ট থেকে &quot;Checkout&quot; এ ক্লিক → ঠিকানা → পেমেন্ট → অর্ডার রিভিউ → কনফার্ম।</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">৫. ট্র্যাক করুন</h2>
      <p>আপনার একাউন্ট থেকে &quot;আমার অর্ডার&quot; এ গিয়ে যেকোনো অর্ডার ট্র্যাক করুন।</p>
    </StaticPageLayout>
  );
}
