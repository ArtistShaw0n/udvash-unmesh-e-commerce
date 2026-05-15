import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/atoms";
import { InfoChip } from "@/components/molecules";
import { StaticPageLayout } from "@/components/organisms";
import { SITE_ADDRESS_BN, SITE_EMAIL, SITE_PHONE_BN } from "@/lib/site";

export const metadata = { title: "যোগাযোগ" };

export default function ContactPage() {
  return (
    <StaticPageLayout
      title="যোগাযোগ"
      description="যেকোনো প্রশ্ন, অভিযোগ বা পরামর্শ — আমরা শুনতে চাই।"
      breadcrumb={[{ label: "হোম", href: "/" }, { label: "যোগাযোগ" }]}
    >
      <div className="grid sm:grid-cols-2 gap-3 not-prose">
        <InfoChip icon={<Phone size={18} />} label={SITE_PHONE_BN} />
        <InfoChip icon={<Mail size={18} />} label={SITE_EMAIL} />
      </div>
      <div className="not-prose mt-4">
        <InfoChip icon={<MapPin size={18} />} label={SITE_ADDRESS_BN} />
      </div>

      <h2 className="text-h3 text-[var(--fg-primary)] pt-6">সরাসরি WhatsApp এ লিখুন</h2>
      <p>
        জরুরি প্রয়োজনে WhatsApp এ সরাসরি বার্তা পাঠান — ১ ঘণ্টার মধ্যে উত্তর পাবেন (ব্যবসায়িক
        ঘণ্টায়)।
      </p>
      <div className="not-prose">
        <Button href="https://wa.me/8801798214677" target="_blank" rel="noopener noreferrer" variant="primary" leftIcon={<MessageCircle size={18} />}>
          WhatsApp এ যান
        </Button>
      </div>
    </StaticPageLayout>
  );
}
