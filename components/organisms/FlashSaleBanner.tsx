import Link from "next/link";
import { CountdownTimer } from "@/components/molecules";
import { clsx } from "@/lib/clsx";

export interface FlashSaleBannerProps {
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  targetDate: Date | string;
  className?: string;
}

/**
 * FlashSaleBanner — Figma node 9:5575 (Frame 1597882752).
 *
 *   Section pad   px 312, py 40 on a 1920 frame (uses container-site)
 *   Card          1296 × 234, bg #006D77, radius 20, padding 40
 *   Inner row     gap 45, left text-block + right countdown
 *   Title         Poppins ExtraBold 30 / 40, tracking -1.0992, white
 *   Subtitle      Poppins Regular 18 / 28, tracking -0.4395, white, w 545
 *   CTA pill      bg white, color #006D77, padding 30/8, radius 100,
 *                 Poppins Bold 20px
 *   Countdown     3 cells × 89×94, gap 16, radius 16
 *                 bg rgba(255,255,255,0.10), border 1px rgba(255,255,255,0.20)
 *                 Number Poppins Bold 36/40, Label Poppins Regular 12/16
 */
export function FlashSaleBanner({
  title,
  subtitle,
  cta,
  targetDate,
  className,
}: FlashSaleBannerProps) {
  return (
    <section className={clsx("py-10 lg:py-[40px]", className)}>
      <div className="container-site">
        <div
          className={clsx(
            "rounded-lg bg-[#006D77] text-white p-6 sm:p-8 lg:p-[40px]",
            "flex flex-col gap-8 lg:gap-[45px] lg:flex-row lg:items-center",
          )}
        >
          {/* Left — text + CTA, takes remaining width */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-[30px] items-start">
            <div className="flex flex-col gap-2.5 max-w-[560px]">
              <h2 className="font-poppins font-extrabold text-white text-[24px] leading-[32px] sm:text-[30px] sm:leading-[40px] tracking-[-0.04em]">
                {title}
              </h2>
              <p className="font-poppins font-normal text-white text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] tracking-[-0.025em] max-w-[545px]">
                {subtitle}
              </p>
            </div>
            <Link
              href={cta.href}
              className={clsx(
                "inline-flex items-center justify-center bg-white text-[#006D77]",
                "px-[30px] py-2 rounded-pill",
                "font-poppins font-bold text-[18px] sm:text-[20px] leading-normal",
                "hover:bg-white/90 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "focus-visible:ring-offset-[#006D77] focus-visible:ring-white",
              )}
            >
              {cta.label}
            </Link>
          </div>

          {/* Right — segmented countdown */}
          <div className="flex-shrink-0">
            <CountdownTimer targetDate={targetDate} tone="onBrand" format="hms" />
          </div>
        </div>
      </div>
    </section>
  );
}
