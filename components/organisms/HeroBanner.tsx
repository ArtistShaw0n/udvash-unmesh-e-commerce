import { Button, CarouselDots, HeroBookIllustration } from "@/components/atoms";
import { clsx } from "@/lib/clsx";

export interface HeroBannerProps {
  badge?: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /**
   * Optional product photo for the hero right slot (Figma 358×415).
   * When set, replaces the stylised SVG fallback. Drop the file
   * at /public/hero/book.png (or .jpg) then pass `imageSrc="/hero/book.png"`
   * from the home-page render.
   */
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

/**
 * HeroBanner — implemented strictly from the Figma node 9:5401.
 *
 *   Outer section  pt-40, pb-30, px-312 on a 1920 frame (the card is
 *                  centered with 312px gutters)
 *   Card           1296×400, bg #006D77, border-radius 20px
 *   Text content   absolute at ml-91 mt-33 (relative to card top-left),
 *                  width 560px. Order:
 *                    pill   → bg #469097, padding 2/16, radius 50
 *                    title  → Inter 40/50 weight 800, tracking -1.099
 *                    desc   → Poppins 18/28 weight 400, tracking -0.44
 *                    CTAs   → gap 20, both 12/30 padding, radius 8
 *   Book image     absolute at ml-838 mt-56, size 358×415. Note the
 *                  book is TALLER than the card (415 > 400) — it
 *                  intentionally overflows the bottom by 71px so
 *                  the card needs `overflow-visible`.
 *   Dots           ml-616 mt-378 (so center is at card's horizontal
 *                  center, vertically 14px from card bottom)
 *
 * Responsive policy:
 *   - lg+ (≥1024px): match the Figma layout exactly — absolute book
 *     position, overflow-visible card.
 *   - below lg: stack to single column with the book below the text
 *     (or hidden, since on phones the book overlay loses meaning).
 *     The card uses overflow-hidden at those widths so the rounded
 *     corners stay clean.
 */
export function HeroBanner({
  badge,
  title,
  description,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt,
  className,
}: HeroBannerProps) {
  return (
    <section
      className={clsx(
        "container-site pt-10 pb-8 sm:pt-12 sm:pb-10 lg:pt-10 lg:pb-[30px]",
        className,
      )}
    >
      {/*
        The teal card.
          - Below lg: overflow-hidden so the rounded corners clip cleanly
            when content is stacked.
          - At lg+: overflow-visible so the absolutely positioned book
            can stick out below per Figma.
      */}
      <div className="relative rounded-lg bg-[#006D77] text-white px-6 py-10 sm:px-10 sm:py-12 lg:px-0 lg:py-0 lg:h-[400px] lg:overflow-visible overflow-hidden">
        {/* Mobile / tablet — stacked single-column layout. */}
        <div className="lg:hidden space-y-6">
          <HeroContent
            badge={badge}
            title={title}
            description={description}
            primaryCta={primaryCta}
            secondaryCta={secondaryCta}
          />
        </div>

        {/* Desktop — absolute positioning per Figma. Container is 1296px
            wide with the card spanning its full width; content is offset
            via left padding. */}
        <div className="hidden lg:block relative h-full w-full">
          {/* Text block — left 91, top 33, width 560 per Figma */}
          <div className="absolute top-[33px] left-[91px] w-[560px] flex flex-col gap-10">
            <HeroContent
              badge={badge}
              title={title}
              description={description}
              primaryCta={primaryCta}
              secondaryCta={secondaryCta}
              variant="desktop"
            />
          </div>

          {/* Book image — top 56, size 358×415. Figma anchors at left 838
              within a 1296-wide card, leaving 100px from the right edge.
              Anchoring via `right` instead of `left` keeps that 100px
              consistent at any container width (e.g. 1216 at 1440vw vs
              1296 in the Figma frame). */}
          <div className="absolute top-[56px] right-[100px] w-[358px] h-[415px]">
            <HeroBookIllustration imageSrc={imageSrc} imageAlt={imageAlt} />
          </div>

          {/* Carousel dots — Figma ml-616 mt-378. Horizontally centered. */}
          <div className="absolute bottom-[14px] left-1/2 -translate-x-1/2">
            <CarouselDots count={3} active={0} tone="onDark" />
          </div>
        </div>

        {/* Mobile/tablet dots — bottom-anchored, doesn't use the absolute
            positioning of the desktop layout. */}
        <div className="lg:hidden mt-4 flex justify-center">
          <CarouselDots count={3} active={0} tone="onDark" />
        </div>
      </div>
    </section>
  );
}

/**
 * Inner content block — badge + title + description + CTAs. Used at all
 * viewports; styling only differs in container layout, not in typography.
 */
function HeroContent({
  badge,
  title,
  description,
  primaryCta,
  secondaryCta,
  variant = "mobile",
}: {
  badge?: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant?: "mobile" | "desktop";
}) {
  return (
    <>
      <div className="flex flex-col gap-2.5">
        {badge && (
          <span className="inline-flex items-center self-start px-4 py-0.5 rounded-pill bg-[#469097] text-white font-poppins font-normal text-[12px] leading-6">
            + {badge}
          </span>
        )}
        <div className="flex flex-col gap-5">
          <h1
            className={clsx(
              "font-inter font-extrabold text-white tracking-[-1.0992px]",
              variant === "desktop"
                ? "text-[40px] leading-[50px]"
                : "text-[28px] leading-[36px] sm:text-[32px] sm:leading-[40px]",
            )}
          >
            {title}
          </h1>
          <p
            className={clsx(
              "font-poppins font-normal text-white tracking-[-0.4395px]",
              variant === "desktop"
                ? "text-[18px] leading-[28px] w-[545px]"
                : "text-[16px] leading-[24px] max-w-xl",
            )}
          >
            {description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-5 items-center">
        <Button
          href={primaryCta.href}
          size={{ base: "md", md: "lg" }}
          className="!bg-white !text-[#006D77] hover:!bg-white/90 !px-[30px] !py-3 !rounded-sm !font-poppins !font-normal !text-[16px] !leading-normal !min-h-0"
        >
          {primaryCta.label}
        </Button>
        {secondaryCta && (
          <Button
            href={secondaryCta.href}
            variant="ghost"
            size={{ base: "md", md: "lg" }}
            className="!border !border-white !text-white hover:!bg-white/10 !px-[30px] !py-3 !rounded-sm !font-poppins !font-normal !text-[16px] !leading-normal !min-h-0"
          >
            {secondaryCta.label}
          </Button>
        )}
      </div>
    </>
  );
}
