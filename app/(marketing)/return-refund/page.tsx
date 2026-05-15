import { StaticPageLayout } from "@/components/organisms";

export const metadata = { title: "রিটার্ন ও রিফান্ড" };

export default function ReturnRefundPage() {
  return (
    <StaticPageLayout
      title="রিটার্ন ও রিফান্ড"
      description="৭ দিনের সহজ রিটার্ন পলিসি — কোন প্রশ্ন ছাড়াই।"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "রিটার্ন ও রিফান্ড" }]}
    >
      <h2 className="text-h3 text-[var(--fg-primary)]">৭ দিনের রিটার্ন</h2>
      <p>
        ডেলিভারি গ্রহণের ৭ দিনের মধ্যে অব্যবহৃত, অক্ষত বই রিটার্ন করা যাবে। [TODO]
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">কিভাবে রিটার্ন করবেন</h2>
      <ol className="list-decimal pl-6 space-y-1">
        <li>আমার অর্ডার পেজে যান</li>
        <li>সংশ্লিষ্ট অর্ডারের পাশে &quot;Return&quot; বাটনে ক্লিক করুন</li>
        <li>কারণ সিলেক্ট করুন</li>
        <li>আমাদের প্রতিনিধি ২৪ ঘণ্টার মধ্যে যোগাযোগ করবেন</li>
      </ol>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">রিফান্ড প্রক্রিয়া</h2>
      <p>
        bKash/Nagad/Card — ৩-৫ কর্মদিবসের মধ্যে রিফান্ড। Cash on Delivery হলে যোগাযোগ করে
        ব্যবস্থা নেওয়া হবে। [TODO]
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">কোন ক্ষেত্রে রিটার্ন গ্রহণযোগ্য নয়</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>বই খুলে ব্যবহার করা হলে</li>
        <li>ক্ষতিগ্রস্ত বা ছেঁড়া অবস্থায়</li>
        <li>৭ দিন পেরিয়ে গেলে</li>
      </ul>
    </StaticPageLayout>
  );
}
