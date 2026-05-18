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
      <div className="relative rounded-lg bg-[#006D77] text-white px-6 py-10 sm:px-10 sm:py-12 xl:px-0 xl:py-0 xl:h-[400px] xl:overflow-visible overflow-hidden">
        {/* Single content tree — typography + layout switches via the
            responsive utility chain inside HeroContent + positioning
            wrapper. Rendering it once keeps a single `<h1>` in the DOM
            so screen readers don't encounter the title twice. */}
        <div className="space-y-6 xl:space-y-0 xl:absolute xl:top-[33px] xl:left-[91px] xl:w-[560px] xl:flex xl:flex-col xl:gap-10">
          <HeroContent
            badge={badge}
            title={title}
            description={description}
            primaryCta={primaryCta}
            secondaryCta={secondaryCta}
          />
        </div>

        {/* Book image — only at xl+ where the Figma absolute layout
            kicks in. Below xl the stacked card hides the book to keep
            the title legible without competing imagery. */}
        <div className="hidden xl:block absolute top-[56px] right-[100px] w-[358px] h-[415px]">
          <HeroBookIllustration imageSrc={imageSrc} imageAlt={imageAlt} />
        </div>

        {/* Carousel dots — anchored to the bottom of the card on xl+,
            below the content stack at smaller viewports. */}
        <div className="mt-4 flex justify-center xl:mt-0 xl:absolute xl:bottom-[14px] xl:left-1/2 xl:-translate-x-1/2">
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
}: {
  badge?: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
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
          {/* Typography ramps through the breakpoint chain so a single
              <h1> serves every viewport — no duplicate heading in the DOM. */}
          <h1 className="font-inter font-extrabold text-white tracking-[-1.0992px] text-[28px] leading-[36px] sm:text-[32px] sm:leading-[40px] xl:text-[40px] xl:leading-[50px]">
            {title}
          </h1>
          <p className="font-poppins font-normal text-white tracking-[-0.4395px] text-[16px] leading-[24px] max-w-xl xl:text-[18px] xl:leading-[28px] xl:max-w-none xl:w-[545px]">
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
