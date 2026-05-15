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
      <div className="relative overflow-hidden rounded-xl bg-brand-700 text-white px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-10 lg:min-h-[400px] flex items-center">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center w-full">
          <div className="space-y-4">
            {badge && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-pill bg-white/10 text-white text-caption font-bold uppercase tracking-wider border border-white/15">
                + {badge}
              </span>
            )}
            <h1 className="text-h1 font-bold leading-[1.1] tracking-tight">{title}</h1>
            <p className="text-body text-white/85 leading-relaxed max-w-xl">{description}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button href={primaryCta.href} variant="primary" size="md"
                      className="!bg-brand-600 hover:!bg-brand-500">
                {primaryCta.label}
              </Button>
              {secondaryCta && (
                <Button
                  href={secondaryCta.href}
                  variant="white"
                  size="md"
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

        {/* Carousel dots — active dot is wider */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <CarouselDots count={3} active={0} tone="onDark" />
        </div>
      </div>
    </section>
  );
}
