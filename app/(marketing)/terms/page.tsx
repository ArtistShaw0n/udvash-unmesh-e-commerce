import { StaticPageLayout } from "@/components/organisms";

export const metadata = {
  title: "ব্যবহারের শর্তাবলী",
  description: "উদ্ভাস-উন্মেষ ব্যবহারের শর্তাবলী ও আইনি নীতিমালা।",
};

export default function TermsPage() {
  return (
    <StaticPageLayout
      title="ব্যবহারের শর্তাবলী"
      description="সর্বশেষ আপডেট: ১ মে, ২০২৬"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "ব্যবহারের শর্তাবলী" }]}
    >
      <p>
        উদ্ভাস-উন্মেষ ("আমরা", "সাইট") ব্যবহারের আগে এই শর্তাবলী মনোযোগ সহকারে পড়ুন।
        সাইটে অর্ডার করে আপনি এই শর্তগুলোতে সম্মত হচ্ছেন।
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">১. একাউন্ট</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>একাউন্ট তৈরির সময় সঠিক ও আপ-টু-ডেট তথ্য দিন</li>
        <li>আপনার পাসওয়ার্ড গোপন রাখার দায়িত্ব আপনার</li>
        <li>অন্যের একাউন্ট ব্যবহার বা ছদ্মবেশ ধারণ নিষিদ্ধ</li>
        <li>একই ফোন/ইমেইলে একাধিক একাউন্ট খোলা নিষিদ্ধ</li>
        <li>সন্দেহজনক কার্যক্রমে আমরা একাউন্ট সাময়িকভাবে স্থগিত করতে পারি</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">২. অর্ডার ও পেমেন্ট</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>সব মূল্য বাংলাদেশি টাকায় (৳)</li>
        <li>সাবটোটাল এর উপর ৫% VAT প্রযোজ্য</li>
        <li>শিপিং চার্জ ৳৫০ (ফ্রি-ডেলিভারি কুপন ব্যতিরেকে)</li>
        <li>অর্ডার করার পর কনফার্মেশন ইমেইল + SMS পাবেন</li>
        <li>পেমেন্ট: bKash, Nagad, Rocket, Card, Cash on Delivery</li>
        <li>COD এর ক্ষেত্রে অর্ডারের সময় কোন payment নেওয়া হয় না — ডেলিভারির সময় নগদ পরিশোধ</li>
        <li>স্টক না থাকলে অর্ডার বাতিল করা হবে + পেমেন্ট রিফান্ড</li>
        <li>আমরা কোন অর্ডার গ্রহণ বা বাতিল করার অধিকার সংরক্ষণ করি (suspected fraud / stock issue)</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৩. ডেলিভারি</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>ঢাকার ভেতরে: ২-৩ কর্মদিবস</li>
        <li>ঢাকার বাইরে: ৩-৫ কর্মদিবস</li>
        <li>দূরবর্তী এলাকায় ৭ দিন পর্যন্ত লাগতে পারে</li>
        <li>সরকারি ছুটি / প্রাকৃতিক দুর্যোগ / কুরিয়ার ধর্মঘটে বিলম্ব হতে পারে</li>
        <li>ভুল ঠিকানা দিলে re-delivery চার্জ গ্রাহক বহন করবেন</li>
        <li>৩ বার ব্যর্থ delivery attempt এর পর অর্ডার বাতিল</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৪. রিটার্ন ও রিফান্ড</h2>
      <p>
        বিস্তারিত নীতি: <a className="font-semibold underline" href="/return-refund">রিটার্ন ও রিফান্ড পেজ</a> দেখুন। মূল কথা:
      </p>
      <ul className="list-disc list-inside space-y-1">
        <li>৭ দিনের মধ্যে রিটার্ন করা যাবে</li>
        <li>রিটার্নকৃত পণ্য অক্ষত ও মূল প্যাকেজিং সহ হতে হবে</li>
        <li>রিফান্ড ৫-৭ কর্মদিবসে আপনার পেমেন্ট মেথডে ফিরে যাবে</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৫. মেধাসম্পদ</h2>
      <p>
        সাইটের সব কন্টেন্ট (লোগো, ছবি, লেখা, কোড) উদ্ভাস-উন্মেষ অথবা সংশ্লিষ্ট অধিকারীর
        সম্পত্তি। ব্যক্তিগত ব্যবহার ব্যতীত অনুমতি ছাড়া কপি, প্রিন্ট, পুনঃপ্রকাশ নিষিদ্ধ।
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৬. ব্যবহারকারীর কন্টেন্ট</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>রিভিউ, রেটিং বা মন্তব্য পোস্ট করলে আপনি সাইটে দেখানোর অধিকার দিচ্ছেন</li>
        <li>অশ্লীল, আক্রমণাত্মক, বিভ্রান্তিকর বা স্প্যামি কন্টেন্ট পোস্ট নিষিদ্ধ</li>
        <li>আমরা যেকোনো রিভিউ মডারেট বা মুছতে পারি</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৭. দায়দায়িত্ব সীমা</h2>
      <p>
        সাইটটি "as-is" ভিত্তিতে দেওয়া হয়। তথ্যে ভুল থাকলে আমরা সংশোধনের চেষ্টা করি কিন্তু
        সম্পূর্ণ accuracy এর গ্যারান্টি দিই না। কোন পরোক্ষ বা সংঘটিত ক্ষয়ক্ষতির জন্য আমরা
        দায়ী থাকব না।
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৮. বিরোধ মীমাংসা</h2>
      <p>
        এই শর্তাবলী বাংলাদেশের আইন দ্বারা পরিচালিত। যেকোন বিরোধ ঢাকা মহানগরের আদালতের
        এখতিয়ারে নিষ্পত্তি হবে।
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৯. শর্তাবলী পরিবর্তন</h2>
      <p>
        আমরা যেকোন সময় এই শর্তাবলী আপডেট করতে পারি। গুরুত্বপূর্ণ পরিবর্তন ইমেইলে জানানো
        হবে। সাইট ব্যবহার চালিয়ে গেলে নতুন শর্তাবলী আপনার দ্বারা গৃহীত বলে গণ্য হবে।
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">যোগাযোগ</h2>
      <p>
        শর্তাবলী সংক্রান্ত প্রশ্নে:{" "}
        <a className="font-semibold underline" href="mailto:legal@udvash-unmesh.com">
          legal@udvash-unmesh.com
        </a>
      </p>
    </StaticPageLayout>
  );
}
