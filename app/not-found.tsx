import { Button } from "@/components/atoms";
import { Footer, Header } from "@/components/organisms";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center section-pad">
        <div className="container-site">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <p className="text-[8rem] sm:text-[10rem] font-black leading-none text-brand-700 tracking-tight">
              404
            </p>
            <h1 className="text-h1 text-[var(--fg-primary)]">পেজটি খুঁজে পাওয়া যায়নি</h1>
            <p className="text-body-lg text-[var(--fg-secondary)]">
              আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরিয়ে নেওয়া হয়েছে।
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Button href="/" variant="primary">হোমে ফিরে যান</Button>
              <Button href="/products" variant="secondary">বই দেখুন</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
