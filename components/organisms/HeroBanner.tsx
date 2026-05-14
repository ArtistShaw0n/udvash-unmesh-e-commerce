import { Button } from "@/components/atoms";
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
              <Button href={primaryCta.href} variant="white" size="md">{primaryCta.label}</Button>
              {secondaryCta && (
                <Button
                  href={secondaryCta.href}
                  variant="secondary"
                  size="md"
                  className="!bg-transparent !text-white !border-white/40 hover:!bg-white/10"
                >
                  {secondaryCta.label}
                </Button>
              )}
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <BookStackIllustration />
          </div>
        </div>

        {/* Carousel indicator dots (visual only for now) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="w-2 h-2 rounded-full bg-white/40" />
          <span className="w-2 h-2 rounded-full bg-white/40" />
        </div>
      </div>
    </section>
  );
}

function BookStackIllustration() {
  return (
    <svg
      viewBox="0 0 220 240"
      className="w-full max-w-[260px] h-auto text-white/30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="40" y="30" width="140" height="180" rx="6" />
      <line x1="50" y1="60" x2="170" y2="60" />
      <line x1="50" y1="90" x2="160" y2="90" />
      <line x1="50" y1="120" x2="170" y2="120" />
      <line x1="50" y1="150" x2="150" y2="150" />
      <path d="M40 30 L40 220 L60 200 L60 50 Z" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
