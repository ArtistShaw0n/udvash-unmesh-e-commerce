import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter, Poppins } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { ConsentProvider } from "@/lib/consent-context";
import { OrdersProvider } from "@/lib/orders-store";
import { ReviewsProvider } from "@/lib/reviews-store";
import { ToastProvider } from "@/lib/toast-context";
import { ConsentAnalyticsSync, PageViewTracker, StructuredData } from "@/components/atoms";
import { CookieConsentBanner } from "@/components/organisms";
import { organizationLd, websiteLd } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Font setup tuned for performance — Lighthouse showed 349KB of font
// payload in 16 requests dominating LCP. Cutting the unused weights
// and the redundant `latin` subset on Hind Siliguri brings that down.
//
//  - Inter: variable font (one file). Drop nothing.
//  - Poppins: code uses 400/500/600/700/800. Was missing 800 in the
//    config (so font-extrabold was falling back). Added.
//  - Hind Siliguri: Bengali fallback only — Inter / Poppins already
//    cover Latin glyphs. Restricted to bengali subset + {400, 600, 700},
//    the only weights Bengali content actually uses on the site.

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bengali = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["400", "600", "700"],
  // `swap` — render fallback immediately, swap to Hind Siliguri once
  // loaded. Tried `optional` (no swap if late) but it didn't move LCP
  // (Lighthouse pegged LCP to the hero description paragraph, not the
  // h1 — and that text uses Poppins, not Hind Siliguri). Bengali
  // typographic quality is more important on this site than the
  // hypothetical 100ms saved on slow networks.
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "উদ্ভাস-উন্মেষ — শিক্ষামূলক বই ও সামগ্রী",
    template: "%s | উদ্ভাস-উন্মেষ",
  },
  description:
    "উদ্ভাস-উন্মেষ — একাডেমিক, এডমিশন, মডেল টেস্ট, ক্যাডেট ও কলেজ ভর্তির বইয়ের অনলাইন বুকশপ। ফ্রি ডেলিভারি ও বিশেষ ছাড় পাচ্ছেন।",
  keywords: [
    "উদ্ভাস",
    "উন্মেষ",
    "Udvash",
    "Unmesh",
    "Bengali books",
    "HSC parallel text",
    "admission books",
    "academic books Bangladesh",
  ],
  authors: [{ name: "উদ্ভাস-উন্মেষ" }],
  openGraph: {
    type: "website",
    siteName: "উদ্ভাস-উন্মেষ",
    locale: "bn_BD",
    url: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
};

// Default theme is light because the entire Figma design system is
// authored against light values. Dark mode remains available as an
// opt-in via the ThemeToggle (it writes 'dark' to localStorage), but we
// no longer auto-flip based on the OS preference — too many users have
// "always dark" set system-wide and that gave them a UI we never
// designed against.
const themeInitScript = `
  (function(){
    try {
      var stored = localStorage.getItem('theme');
      if (stored === 'dark') document.documentElement.classList.add('dark');
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${bengali.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {/* Site-wide JSON-LD: Organization + WebSite (with SearchAction) */}
        <StructuredData data={[organizationLd(), websiteLd()]} />
        <ConsentProvider>
          <ToastProvider>
            <AuthProvider>
              <OrdersProvider>
                <ReviewsProvider>
                  <CartProvider>
                    {children}
                    <ConsentAnalyticsSync />
                    <PageViewTracker />
                    <CookieConsentBanner />
                  </CartProvider>
                </ReviewsProvider>
              </OrdersProvider>
            </AuthProvider>
          </ToastProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
