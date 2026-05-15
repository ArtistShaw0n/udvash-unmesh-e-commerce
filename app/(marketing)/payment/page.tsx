import { PaymentMethodsRow } from "@/components/molecules";
import { StaticPageLayout } from "@/components/organisms";

export const metadata = { title: "পেমেন্ট পদ্ধতি" };

export default function PaymentPage() {
  return (
    <StaticPageLayout
      title="পেমেন্ট পদ্ধতি"
      description="নিরাপদ পেমেন্ট — bKash, Nagad, Rocket, Card, Cash on Delivery — সব অপশন।"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "পেমেন্ট পদ্ধতি" }]}
    >
      <h2 className="text-h3 text-[var(--fg-primary)]">মোবাইল ব্যাংকিং</h2>
      <p>bKash · Nagad · Rocket · Upay — যেকোনোটি দিয়ে পেমেন্ট করুন। চেকআউটে পেমেন্ট ইন্সট্রাকশন পাবেন।</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">কার্ড</h2>
      <p>VISA · Mastercard · American Express · JCB · Diners Club — সব নিরাপদ গেটওয়ের মাধ্যমে।</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">Cash on Delivery</h2>
      <p>ঢাকার ভেতরে এবং বিভাগীয় শহরে ক্যাশ অন ডেলিভারি অপশন উপলব্ধ।</p>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-4">আমরা যেসব পদ্ধতি সাপোর্ট করি</h2>
      <div className="not-prose mt-3">
        <div className="bg-neutral-100 rounded-lg p-3">
          <PaymentMethodsRow />
        </div>
      </div>
    </StaticPageLayout>
  );
}
