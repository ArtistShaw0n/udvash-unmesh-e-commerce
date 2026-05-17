import { WifiOff } from "lucide-react";
import { Button } from "@/components/atoms";

export const metadata = {
  title: "অফলাইন",
  description: "ইন্টারনেট কানেকশন পাওয়া যাচ্ছে না।",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <section className="section-pad">
      <div className="container-site">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-[var(--bg-surface-muted)] text-[var(--fg-muted)]">
            <WifiOff size={28} />
          </div>
          <h1 className="text-h2 text-[var(--fg-primary)]">আপনি অফলাইন</h1>
          <p className="text-body text-[var(--fg-secondary)]">
            ইন্টারনেট কানেকশন পাওয়া যাচ্ছে না। কানেকশন ফিরে এলে পেজটি আবার লোড করুন।
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Button href="/" variant="primary" size={{ base: "md", md: "lg" }}>
              হোমে যান
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
