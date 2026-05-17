import type { Metadata } from "next";
import { Button } from "@/components/atoms";
import { SuccessHero } from "@/components/organisms";

export const metadata: Metadata = {
  title: "অর্ডার সফল",
  description: "আপনার অর্ডার সফলভাবে নেওয়া হয়েছে।",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <SuccessHero
      title="অর্ডার সফলভাবে নেওয়া হয়েছে 🎉"
      description="ধন্যবাদ! আপনার অর্ডার আমাদের কাছে পৌঁছেছে। ২৪ ঘণ্টার মধ্যে আমাদের প্রতিনিধি যোগাযোগ করবেন। ডেলিভারি ৩-৫ কর্মদিবসের মধ্যে।"
      meta={
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 inline-block">
          <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">Order Number</p>
          <p className="text-h3 font-bold text-brand-700 dark:text-brand-400 tabular-nums">#{id}</p>
        </div>
      }
      actions={
        <>
          <Button href={`/account/orders/${id}`} variant="primary" size={{ base: "md", md: "lg" }}>অর্ডার ট্র্যাক করুন</Button>
          <Button href="/products" variant="secondary" size={{ base: "md", md: "lg" }}>কেনাকাটা চালিয়ে যান</Button>
        </>
      }
    />
  );
}
