import { StaticPageLayout } from "@/components/organisms";

export const metadata = {
  title: "গোপনীয়তা নীতি",
  description:
    "উদ্ভাস-উন্মেষের গোপনীয়তা নীতি — আপনার ব্যক্তিগত তথ্য কীভাবে সংগ্রহ, ব্যবহার ও সুরক্ষিত করা হয়।",
};

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      title="গোপনীয়তা নীতি"
      description="সর্বশেষ আপডেট: ১ মে, ২০২৬"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "গোপনীয়তা নীতি" }]}
    >
      <p>
        উদ্ভাস-উন্মেষ আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ। এই নীতিতে
        ব্যাখ্যা করা হয়েছে আমরা কী তথ্য সংগ্রহ করি, কেন করি, কীভাবে ব্যবহার করি, এবং
        আপনার অধিকারগুলো কী।
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">১. আমরা কী তথ্য সংগ্রহ করি</h2>

      <h3 className="text-h4 text-[var(--fg-primary)] pt-3">আপনি যা দেন</h3>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>একাউন্ট তথ্য</strong> — নাম, ইমেইল, ফোন নম্বর, পাসওয়ার্ড (encrypted)</li>
        <li><strong>ডেলিভারি তথ্য</strong> — শিপিং ঠিকানা, প্রাপকের নাম + ফোন</li>
        <li><strong>পেমেন্ট তথ্য</strong> — bKash/Nagad/Card নম্বরের লাস্ট ৪ ডিজিট (full data পেমেন্ট গেটওয়ে আমাদের সাথে শেয়ার করে না)</li>
        <li><strong>অর্ডার ইতিহাস</strong> — যা কিনেছেন, কখন, কোথায় পাঠিয়েছেন</li>
        <li><strong>যোগাযোগ</strong> — সাপোর্ট ইমেইল / কল রেকর্ডিং / চ্যাট লগ</li>
      </ul>

      <h3 className="text-h4 text-[var(--fg-primary)] pt-3">স্বয়ংক্রিয় সংগৃহীত তথ্য</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>IP address, ব্রাউজার ও ডিভাইস তথ্য (অপব্যবহার রোধে)</li>
        <li>সাইটের কোন পেজ কত সময় ব্যবহার করেছেন (analytics কুকি, আপনার সম্মতিতে)</li>
        <li>আপনি যে পেজ থেকে আমাদের সাইটে এসেছেন (referrer)</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">২. আমরা কেন এই তথ্য ব্যবহার করি</h2>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>অর্ডার প্রসেসিং</strong> — পেমেন্ট নিতে, বই পাঠাতে, রিটার্ন/রিফান্ড প্রসেস করতে</li>
        <li><strong>কাস্টমার সাপোর্ট</strong> — আপনার সমস্যা সমাধানে</li>
        <li><strong>একাউন্ট সিকিউরিটি</strong> — অনুমোদনহীন প্রবেশ রোধে</li>
        <li><strong>সাইট উন্নয়ন</strong> — কোন ফিচার কাজ করে, কোনটা না — সেটা বুঝতে</li>
        <li><strong>মার্কেটিং (অপশনাল)</strong> — শুধুমাত্র আপনি সাবস্ক্রাইব করলে নতুন বই/অফারের ইমেইল</li>
        <li><strong>আইনি বাধ্যবাধকতা</strong> — সরকারি কর্তৃপক্ষের অনুরোধে (NID ভেরিফিকেশন, ট্যাক্স রেকর্ড)</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৩. আমরা কাদের সাথে শেয়ার করি</h2>
      <p>
        আপনার ডেটা <strong>বিক্রি করা হয় না</strong>। আমরা শুধুমাত্র নিম্নলিখিত পক্ষের সাথে
        শেয়ার করি — এবং প্রতিটি শুধুমাত্র যতটুকু প্রয়োজন ততটুকু পায়:
      </p>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>কুরিয়ার পার্টনার</strong> (Pathao / Sundarban / RedX / Steadfast) — ডেলিভারি ঠিকানা ও ফোন</li>
        <li><strong>পেমেন্ট গেটওয়ে</strong> (bKash / Nagad / SSLCommerz) — অর্ডার আইডি ও amount</li>
        <li><strong>SMS/ইমেইল প্রদানকারী</strong> — শুধু transactional মেসেজের জন্য</li>
        <li><strong>আইনি কর্তৃপক্ষ</strong> — শুধুমাত্র legal notice / আদালতের আদেশ এ</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৪. ডেটা সংরক্ষণ ও মুছে ফেলা</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>অর্ডার ডেটা — ৫ বছর (BD VAT/Tax আইনের জন্য)</li>
        <li>একাউন্ট তথ্য — যতদিন একাউন্ট সক্রিয় + ১ বছর</li>
        <li>সাপোর্ট ইতিহাস — ২ বছর</li>
        <li>একাউন্ট ডিলিট করলে — ৩০ দিনের মধ্যে স্থায়ীভাবে মুছে ফেলা হয় (legal hold ব্যতিরেকে)</li>
      </ul>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৫. আপনার অধিকার</h2>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>দেখা</strong> — আমরা আপনার সম্পর্কে কী জানি তা যেকোনো সময় চাইতে পারেন</li>
        <li><strong>সংশোধন</strong> — ভুল তথ্য ঠিক করতে আমাদের বলতে পারেন</li>
        <li><strong>মুছে ফেলা</strong> — একাউন্ট ও ডেটা ডিলিট করতে চাইলে আবেদন করুন</li>
        <li><strong>ডেটা পোর্টেবিলিটি</strong> — আপনার ডেটা JSON ফরম্যাটে এক্সপোর্ট করতে পারেন</li>
        <li><strong>সম্মতি প্রত্যাহার</strong> — কুকি বা মার্কেটিং সম্মতি যেকোনো সময় বদলাতে পারেন</li>
      </ul>
      <p>
        এই অধিকার ব্যবহারে যোগাযোগ:{" "}
        <a className="font-semibold underline" href="mailto:privacy@udvash-unmesh.com">
          privacy@udvash-unmesh.com
        </a>
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৬. কুকিজ</h2>
      <p>
        আমরা ৩ ক্যাটাগরির কুকি ব্যবহার করি:
      </p>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>Necessary</strong> (সর্বদা চালু) — সেশন, কার্ট, লগইন স্ট্যাটাস</li>
        <li><strong>Analytics</strong> (আপনার সম্মতিতে) — কোন পেজ কাজ করছে দেখতে</li>
        <li><strong>Marketing</strong> (আপনার সম্মতিতে) — রিটার্গেটিং অ্যাডস</li>
      </ul>
      <p>প্রথমবার ভিজিট করলেই কুকি ব্যানারে এই পছন্দ সেট করতে পারবেন।</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৭. সিকিউরিটি</h2>
      <p>
        পাসওয়ার্ড bcrypt এ হ্যাশড অবস্থায় সংরক্ষিত। সব ডেটা ট্রান্সফার HTTPS/TLS এর
        মাধ্যমে এনক্রিপ্টেড। সার্ভার ও ডেটাবেস অ্যাক্সেস শুধুমাত্র অনুমোদিত স্টাফদের জন্য।
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৮. শিশুদের গোপনীয়তা</h2>
      <p>
        আমাদের সেবা ১৩+ বছর বয়সীদের জন্য। আপনি যদি ১৩ বছরের নিচে হন, অভিভাবকের
        তত্ত্বাবধানে ব্যবহার করুন।
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">৯. নীতির পরিবর্তন</h2>
      <p>
        এই নীতি আপডেট হলে আমরা পেজের উপরে তারিখ পরিবর্তন করব এবং আপনার ইমেইলে নোটিশ
        পাঠাব। ছোটখাট পরিবর্তন (ক্ল্যারিফিকেশন) এর জন্য আলাদা নোটিফিকেশন নাও যেতে পারে।
      </p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">যোগাযোগ</h2>
      <p>
        গোপনীয়তা সংক্রান্ত যেকোন প্রশ্নে:
        <br />
        ইমেইল: <a className="font-semibold underline" href="mailto:privacy@udvash-unmesh.com">privacy@udvash-unmesh.com</a>
        <br />
        ফোন: ০৯৬৬৬-৭৭৫৫৩৩
        <br />
        ঠিকানা: হাউজ ৭১, রোড ৪, ব্লক সি, বনশ্রী, ঢাকা ১২১৯
      </p>
    </StaticPageLayout>
  );
}
