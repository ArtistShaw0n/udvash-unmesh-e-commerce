import { Button } from "@/components/atoms";
import { CountdownTimer } from "@/components/molecules";
import { clsx } from "@/lib/clsx";

export interface FlashSaleBannerProps {
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  targetDate: Date | string;
  className?: string;
}

export function FlashSaleBanner({
  title,
  subtitle,
  cta,
  targetDate,
  className,
}: FlashSaleBannerProps) {
  return (
    <section className={clsx("section-pad-sm", className)}>
      <div className="container-site">
        <div className="rounded-xl bg-brand-700 text-white px-6 py-6 sm:px-8 sm:py-8 lg:px-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
          <div className="flex-1 space-y-3">
            <h2 className="text-h2 font-bold">{title}</h2>
            <p className="text-body text-white/85">{subtitle}</p>
            <div className="pt-1">
              <Button href={cta.href} variant="white" size="md">{cta.label}</Button>
            </div>
          </div>
          <div className="lg:flex-shrink-0">
            <CountdownTimer targetDate={targetDate} tone="onBrand" format="hms" />
          </div>
        </div>
      </div>
    </section>
  );
}
