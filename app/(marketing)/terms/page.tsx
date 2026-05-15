import { StaticPageLayout } from "@/components/organisms";

export const metadata = { title: "ব্যবহারের শর্তাবলী" };

export default function TermsPage() {
  return (
    <StaticPageLayout
      title="ব্যবহারের শর্তাবলী"
      description="সর্বশেষ আপডেট: ১৬ মে, ২০২৬"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "ব্যবহারের শর্তাবলী" }]}
    >
      <h2 className="text-h3 text-[var(--fg-primary)]">১. পরিচয়</h2>
      <p>উদ্ভাস-উন্মেষ (udvash-unmesh.com) ব্যবহারের আগে এই শর্তাবলী মনোযোগ সহকারে পড়ুন। [TODO]</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">২. একাউন্ট</h2>
      <p>একাউন্ট তৈরির সময় সঠিক ও আপ-টু-ডেট তথ্য প্রদান বাধ্যতামূলক। [TODO]</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">৩. অর্ডার ও পেমেন্ট</h2>
      <p>সব মূল্য বাংলাদেশি টাকায় (৳)। ভ্যাট ও শিপিং চার্জ পৃথকভাবে প্রযোজ্য। [TODO]</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">৪. ডেলিভারি</h2>
      <p>ঢাকার ভেতরে ২-৩ কর্মদিবস, ঢাকার বাইরে ৩-৫ কর্মদিবসের মধ্যে ডেলিভারি। [TODO]</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">৫. মেধাসম্পদ</h2>
      <p>সাইটের সব কন্টেন্ট, লোগো ও ডিজাইন উদ্ভাস-উন্মেষ এর সম্পত্তি। [TODO]</p>
    </StaticPageLayout>
  );
}
