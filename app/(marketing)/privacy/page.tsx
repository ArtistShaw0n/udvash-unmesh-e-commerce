import { StaticPageLayout } from "@/components/organisms";

export const metadata = { title: "গোপনীয়তা নীতি" };

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      title="গোপনীয়তা নীতি"
      description="সর্বশেষ আপডেট: ১৬ মে, ২০২৬"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "গোপনীয়তা নীতি" }]}
    >
      <h2 className="text-h3 text-[var(--fg-primary)]">আমরা কোন তথ্য সংগ্রহ করি</h2>
      <p>নাম, ইমেইল, ফোন নম্বর, ডেলিভারি ঠিকানা — শুধুমাত্র অর্ডার ফুলফিল করার জন্য। [TODO]</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">আমরা কিভাবে ব্যবহার করি</h2>
      <p>অর্ডার প্রসেস, ডেলিভারি, কাস্টমার সাপোর্ট এবং প্রাসঙ্গিক প্রমোশন। [TODO]</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">আপনার অধিকার</h2>
      <p>আপনার ডেটা দেখতে, এডিট করতে বা মুছতে যেকোনো সময় support@udvash-unmesh.com এ যোগাযোগ করুন। [TODO]</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">কুকিজ</h2>
      <p>সাইট পারফরম্যান্স ও কার্ট মনে রাখতে আমরা কুকিজ ব্যবহার করি। [TODO]</p>
    </StaticPageLayout>
  );
}
