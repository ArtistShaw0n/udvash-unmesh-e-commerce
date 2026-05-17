import { StaticPageLayout } from "@/components/organisms";

export const metadata = {
  title: "রিটার্ন ও রিফান্ড",
  description:
    "৭ দিনের সহজ রিটার্ন পলিসি — শর্ত, প্রক্রিয়া, রিফান্ডের সময়সীমা।",
};

export default function ReturnRefundPage() {
  return (
    <StaticPageLayout
      title="রিটার্ন ও রিফান্ড"
      description="৭ দিনের সহজ রিটার্ন পলিসি — কোন প্রশ্ন ছাড়াই।"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "রিটার্ন ও রিফান্ড" }]}
    >
      <div className="rounded-lg bg-success-50 dark:bg-success-700/15 border border-success-200 dark:border-success-700/40 p-5 not-prose">
        <p className="text-body font-semibold text-success-800 dark:text-success-200">
          ৭ দিনের ১০০% মূল্য ফেরত গ্যারান্টি
        </p>
        <p className="text-body-sm text-success-700 dark:text-success-300 mt-1">
          ডেলিভারির ৭ দিনের মধ্যে রিটার্ন করলে সম্পূর্ণ মূল্য (পেমেন্ট মেথড ভেদে)
          আপনার একাউন্টে ফেরত পাবেন।
        </p>
      </div>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">কখন রিটার্ন গ্রহণযোগ্য</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>ভুল বই বা সংস্করণ পাঠানো হয়েছে</li>
        <li>বই ক্ষতিগ্রস্ত বা পৃষ্ঠা ছেঁড়া অবস্থায় এসেছে</li>
        <li>বইয়ের ভেতরে প্রিন্টিং সমস্যা</li>
        <li>পচা / নষ্ট অবস্থায় ডেলিভারি</li>
        <li>আপনি অর্ডার বাতিল করতে চান (ডেলিভারির পরও)</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">কোন ক্ষেত্রে রিটার্ন গ্রহণযোগ্য নয়</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>৭ দিন পেরিয়ে গেলে</li>
        <li>বই ব্যবহার করা হলে (লেখা, দাগ, ভাঁজ)</li>
        <li>মূল প্যাকেজিং নষ্ট হলে</li>
        <li>ডিজিটাল প্রোডাক্ট (যদি ভবিষ্যতে থাকে)</li>
        <li>কাস্টমাইজড বা personalized বই</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">রিটার্ন কীভাবে করবেন</h2>
      <ol className="list-decimal list-inside space-y-2">
        <li><strong>আমার অর্ডার পেজে যান</strong> — Account → My Orders</li>
        <li><strong>সংশ্লিষ্ট অর্ডার খুলুন</strong> এবং "রিটার্ন রিকোয়েস্ট" বাটনে ক্লিক করুন</li>
        <li><strong>কারণ + ছবি</strong> দিন (ছবি ঐচ্ছিক কিন্তু সাহায্যকারী)</li>
        <li><strong>২৪ ঘণ্টার মধ্যে কনফার্মেশন</strong> পাবেন ইমেইল + SMS এ</li>
        <li><strong>আমাদের কুরিয়ার পার্টনার পিকআপ করবে</strong> — ২-৪ কর্মদিবসে</li>
        <li><strong>পণ্য যাচাই হলেই রিফান্ড</strong> ইনিশিয়েট হবে</li>
      </ol>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">রিফান্ড প্রসেসিং সময়সীমা</h2>
      <div className="not-prose rounded-lg border border-[var(--border-default)] overflow-hidden">
        <table className="w-full text-body-sm">
          <thead className="bg-[var(--bg-surface-muted)]">
            <tr>
              <th className="text-left px-4 py-2.5">পেমেন্ট মেথড</th>
              <th className="text-left px-4 py-2.5">রিফান্ড গন্তব্য</th>
              <th className="text-right px-4 py-2.5">সময়</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-muted)]">
            <tr><td className="px-4 py-2.5">bKash</td><td className="px-4 py-2.5">একই বিকাশ নম্বরে</td><td className="px-4 py-2.5 text-right">৩-৫ দিন</td></tr>
            <tr><td className="px-4 py-2.5">Nagad</td><td className="px-4 py-2.5">একই নগদ নম্বরে</td><td className="px-4 py-2.5 text-right">৩-৫ দিন</td></tr>
            <tr><td className="px-4 py-2.5">Card</td><td className="px-4 py-2.5">মূল কার্ডে</td><td className="px-4 py-2.5 text-right">৫-৭ দিন</td></tr>
            <tr><td className="px-4 py-2.5">Cash on Delivery</td><td className="px-4 py-2.5">আপনার বিকাশ/ব্যাংকে (আপনি বলবেন)</td><td className="px-4 py-2.5 text-right">৩-৫ দিন</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">শিপিং চার্জ</h2>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>আমাদের ভুলে</strong> (ভুল বই / ত্রুটিযুক্ত পণ্য) — শিপিং চার্জ আমাদের, পিকআপও ফ্রি</li>
        <li><strong>আপনার change-of-mind</strong> — পিকআপ চার্জ ৳১০০ আপনার থেকে কাটা হবে রিফান্ড থেকে</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">যোগাযোগ</h2>
      <p>
        রিটার্ন সংক্রান্ত যেকোন প্রশ্নে:{" "}
        <a className="font-semibold underline" href="mailto:returns@udvash-unmesh.com">
          returns@udvash-unmesh.com
        </a>
        {" / "}
        <a className="font-semibold underline" href="tel:09666775533">০৯৬৬৬-৭৭৫৫৩৩</a>
      </p>
    </StaticPageLayout>
  );
}
