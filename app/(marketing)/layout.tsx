import { FloatingDesignSystemButton, InstallPrompt, WhatsAppButton } from "@/components/atoms";
import { Header, Footer, MobileBottomNav } from "@/components/organisms";

// The design-system palette FAB is a developer-only navigation helper —
// it has no business sitting on top of the WhatsApp button on every
// public page. Render it only in dev builds.
const SHOW_DESIGN_SYSTEM_FAB = process.env.NODE_ENV !== "production";

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
      {SHOW_DESIGN_SYSTEM_FAB && <FloatingDesignSystemButton />}
    </>
  );
}
