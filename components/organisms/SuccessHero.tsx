import { CheckCircle2 } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface SuccessHeroProps {
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function SuccessHero({ title, description, meta, actions, className }: SuccessHeroProps) {
  return (
    <section className={clsx("section-pad-sm", className)}>
      <div className="container-site">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="inline-flex w-20 h-20 sm:w-24 sm:h-24 items-center justify-center rounded-full bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-300">
            <CheckCircle2 size={48} strokeWidth={2.2} />
          </div>
          <h1 className="text-h1 text-[var(--fg-primary)] tracking-tight">{title}</h1>
          {description && (
            <p className="text-body-lg text-[var(--fg-secondary)] leading-relaxed">{description}</p>
          )}
          {meta && <div className="pt-2">{meta}</div>}
          {actions && (
            <div className="pt-4 flex flex-wrap gap-3 justify-center">{actions}</div>
          )}
        </div>
      </div>
    </section>
  );
}
