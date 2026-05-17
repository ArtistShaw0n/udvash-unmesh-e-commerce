import { Button, CarouselDots, HeroBookIllustration } from "@/components/atoms";
import { clsx } from "@/lib/clsx";

export interface HeroBannerProps {
  badge?: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
}

/**
 * HeroBanner — pixel spec from the Figma export
 * (`udvash-roadmap copy.docx` → Frame 1597882748 / Rectangle 21407).
 *
 *   Card        1296×400 — bg #006D77, border-radius 20px
 *   Pill        bg #469097, border-radius 50px, padding 2px 16px,
 *               Poppins 12px / 24px weight 400, color white
 *   Title       Inter 40px / 50px weight 800, letter-spacing -1.099px,
 *               color white
 *   Subtitle    Poppins 18px / 28px weight 400, letter-spacing -0.44px,
 *               color rgba(255,255,255,0.85)
 *   Primary CTA bg white, color #006D77, padding 12px 30px,
 *               border-radius 8px, Poppins 16px weight 400
 *   Secondary   transparent bg, 1px solid white, color white, same
 *               shape as primary
 *   Dots        positioned bottom-center: active 32×8 bg #E5F0F1,
 *               inactive 8×8 bg #469097 (CarouselDots tone="onDark")
 */
export function HeroBanner({
  badge,
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
}: HeroBannerProps) {
  return (
    <section className={clsx("section-pad-sm container-site", className)}>
      <div className="relative overflow-hidden rounded-[20px] bg-[#006D77] text-white px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-10 lg:min-h-[400px] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-center w-full min-w-0 [&>*]:min-w-0">
          <div className="space-y-5 lg:space-y-10">
            {badge && (
              <span className="inline-flex items-center px-4 py-0.5 rounded-[50px] bg-[#469097] text-white font-poppins font-normal text-[12px] leading-6">
                + {badge}
              </span>
            )}
            <div className="space-y-5">
              <h1 className="font-inter font-extrabold text-white text-[28px] leading-[36px] sm:text-[32px] sm:leading-[40px] lg:text-[40px] lg:leading-[50px] tracking-[-0.04em]">
                {title}
              </h1>
              <p className="font-poppins font-normal text-[16px] leading-[24px] lg:text-[18px] lg:leading-[28px] tracking-[-0.025em] text-white/85 max-w-xl">
                {description}
              </p>
            </div>
            <div className="flex flex-wrap gap-5 pt-1">
              {/* Primary — white bg w/ teal text per Figma */}
              <Button
                href={primaryCta.href}
                size={{ base: "md", md: "lg" }}
                className="!bg-white !text-[#006D77] hover:!bg-white/90 !px-[30px] !py-3 !rounded-[8px] !font-poppins !font-normal !text-[16px] !leading-6 !min-h-0"
              >
                {primaryCta.label}
              </Button>
              {secondaryCta && (
                <Button
                  href={secondaryCta.href}
                  variant="ghost"
                  size={{ base: "md", md: "lg" }}
                  className="!border !border-white !text-white hover:!bg-white/10 !px-[30px] !py-3 !rounded-[8px] !font-poppins !font-normal !text-[16px] !leading-6 !min-h-0"
                >
                  {secondaryCta.label}
                </Button>
              )}
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <HeroBookIllustration />
          </div>
        </div>

        {/* Carousel dots — active 32×8 #E5F0F1, inactive 8×8 #469097 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <CarouselDots count={3} active={0} tone="onDark" />
        </div>
      </div>
    </section>
  );
}
