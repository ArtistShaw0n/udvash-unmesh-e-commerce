import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { LogoWhite } from "@/components/atoms";
import { PaymentMethodsRow } from "@/components/molecules";
import {
  SITE_ADDRESS_BN,
  SITE_EMAIL,
  SITE_PHONE_BN,
  SITE_SOCIAL,
  SITE_TAGLINE_BN,
} from "@/lib/site";
import { clsx } from "@/lib/clsx";

export interface FooterProps {
  className?: string;
}

const QUICK_LINKS = [
  { label: "আমাদের সম্পর্কে", href: "/about" },
  { label: "যোগাযোগ", href: "/contact" },
  { label: "ব্যবহারের শর্তাবলী", href: "/terms" },
  { label: "গোপনীয়তা নীতি", href: "/privacy" },
  { label: "ট্র্যাক মাই অর্ডার", href: "/orders/track" },
];

const INFO_LINKS = [
  { label: "ব্যবহারকারী নির্দেশিকা", href: "/guide" },
  { label: "পেমেন্ট পদ্ধতি", href: "/payment" },
  { label: "রিটার্ন ও রিফান্ড", href: "/return-refund" },
  { label: "হেল্প সেন্টার", href: "/help" },
];

/**
 * Footer — Figma node 9:5882.
 *
 *   Wrapper        bg #006D77 (Color 1), pt 50, pb 30
 *   Inner stack    gap 24 between rows, 1296px max width
 *   Content row    1296 wide, 127px gap between columns
 *     Column 1     281w — logo + tagline (Poppins Medium 14/24) +
 *                  4 socials (40×40 border-white rounded-full)
 *     Column 2/3   ~140w — heading "কুইক লিংকস" / "ইনফো"
 *                  Poppins SemiBold 20/26.4 white. Links Poppins
 *                  Regular 14/24 white.
 *     Column 4     329w — heading "যোগাযোগ" + phone/email/address
 *                  rows with icons.
 *   Payments       1240×39 strip (PaymentMethodsRow image)
 *   Copyright      centered single line, Poppins/Manrope Regular
 *                  14/24 white
 */
export function Footer({ className }: FooterProps) {
  return (
    <footer className={clsx("bg-brand-600 text-white pt-[50px] pb-[30px]", className)}>
      <div className="container-site flex flex-col gap-6 items-center">
        <div className="w-full grid gap-10 sm:gap-12 lg:gap-x-[127px] lg:gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[281px_140px_1fr_329px]">
          {/* Brand */}
          <div className="space-y-5">
            <LogoWhite size="md" href="/" />
            <p className="font-poppins font-normal text-[14px] leading-6 text-white max-w-[260px]">
              {SITE_TAGLINE_BN}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <SocialIcon href={SITE_SOCIAL.facebook} label="Facebook" icon={<FbIcon />} />
              <SocialIcon href={SITE_SOCIAL.instagram} label="Instagram" icon={<IgIcon />} />
              <SocialIcon href={SITE_SOCIAL.youtube} label="YouTube" icon={<YtIcon />} />
              <SocialIcon href={SITE_SOCIAL.linkedin} label="LinkedIn" icon={<LiIcon />} />
            </div>
          </div>

          {/* Quick Links */}
          <FooterColumn title="কুইক লিংকস">
            {QUICK_LINKS.map((l) => <FooterLink key={l.href} {...l} />)}
          </FooterColumn>

          {/* Info */}
          <FooterColumn title="ইনফো">
            {INFO_LINKS.map((l) => <FooterLink key={l.href} {...l} />)}
          </FooterColumn>

          {/* Contact */}
          <FooterColumn title="যোগাযোগ">
            <a
              href={`tel:${SITE_PHONE_BN}`}
              className="flex items-center gap-4 font-poppins font-normal text-[14px] leading-6 text-white hover:text-white/90 transition-colors"
            >
              <Phone size={18} className="flex-shrink-0" />
              <span>{SITE_PHONE_BN}</span>
            </a>
            <a
              href={`mailto:${SITE_EMAIL}`}
              className="flex items-center gap-4 font-poppins font-normal text-[14px] leading-6 text-white hover:text-white/90 transition-colors break-all"
            >
              <Mail size={18} className="flex-shrink-0" />
              <span>{SITE_EMAIL}</span>
            </a>
            <p className="flex items-start gap-4 font-poppins font-normal text-[14px] leading-6 text-white">
              <MapPin size={18} className="mt-0.5 flex-shrink-0" />
              <span className="max-w-[180px]">{SITE_ADDRESS_BN}</span>
            </p>
          </FooterColumn>
        </div>

        {/* Payment methods strip — 1240×39 image */}
        <div className="w-full max-w-[1240px]">
          <PaymentMethodsRow />
        </div>

        {/* Copyright — centered single line */}
        <p className="font-poppins font-normal text-[14px] leading-6 text-white text-center">
          © ২০২৬ উদ্ভাস-উন্মেষ। সর্বস্বত্ব সংরক্ষিত
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-poppins font-semibold text-[20px] leading-[26.4px] text-white">
        {title}
      </h3>
      <ul className="flex flex-col gap-[17px]">
        {Array.isArray(children) ? children.map((c, i) => <li key={i}>{c}</li>) : children}
      </ul>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="font-poppins font-normal text-[14px] leading-6 text-white hover:text-white/85 transition-colors"
    >
      {label}
    </Link>
  );
}

function SocialIcon({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in new tab)`}
      // Figma: 40×40, 1px white border, rounded-full, 18×18 icon inside
      className="inline-flex w-10 h-10 items-center justify-center rounded-full border border-white text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
    >
      {icon}
    </a>
  );
}

// Inline brand icons (lucide-react v1 dropped brand icons for trademark reasons).
function FbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.197 21.5v-9h-3v-3.5h3V6.7c0-3.038 1.844-4.7 4.554-4.7 1.297 0 2.41.096 2.735.139v3.17h-1.875c-1.473 0-1.758.7-1.758 1.726V9h3.516l-.458 3.5h-3.058v9h-3.656z"/>
    </svg>
  );
}
function IgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}
function YtIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}
function LiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
