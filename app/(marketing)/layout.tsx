import { FloatingDesignSystemButton, InstallPrompt, WhatsAppButton } from "@/components/atoms";
import { Header, Footer, MobileBottomNav } from "@/components/organisms";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content" className="flex-1 pb-16 sm:pb-0">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <InstallPrompt />
      <MobileBottomNav />
      <FloatingDesignSystemButton />
    </>
  );
}
