import { Header, Footer } from "@/components/organisms";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header cartCount={99} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
