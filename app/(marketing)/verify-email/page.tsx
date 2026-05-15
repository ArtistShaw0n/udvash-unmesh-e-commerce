import { SuccessHero } from "@/components/organisms";
import { Button } from "@/components/atoms";

export const metadata = { title: "ইমেইল ভেরিফাই" };

export default function VerifyEmailPage() {
  return (
    <SuccessHero
      title="ইমেইল ভেরিফাইড ✓"
      description="আপনার একাউন্ট সফলভাবে সক্রিয় হয়েছে। এবার লগইন করে কেনাকাটা শুরু করুন।"
      actions={
        <>
          <Button href="/login" variant="primary" size="lg">লগইন করুন</Button>
          <Button href="/" variant="secondary" size="lg">হোমে যান</Button>
        </>
      }
    />
  );
}
