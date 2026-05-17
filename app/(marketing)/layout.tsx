import { FloatingDesignSystemButton, InstallPrompt, WhatsAppButton } from "@/components/atoms";
import { Header, Footer } from "@/components/organisms";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <InstallPrompt />
      <FloatingDesignSystemButton />
    </>
  );
}
