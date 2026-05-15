import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface StaticPageHeroProps {
  title: string;
  description?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  className?: string;
}

export function StaticPageHero({ title, description, breadcrumb, className }: StaticPageHeroProps) {
  return (
    <section className={clsx("bg-[var(--bg-surface-muted)] section-pad-sm", className)}>
      <div className="container-site space-y-3">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1.5 text-body-sm">
              {breadcrumb.map((item, i) => {
                const last = i === breadcrumb.length - 1;
                return (
                  <li key={i} className="flex items-center gap-1.5">
                    {item.href && !last ? (
                      <Link href={item.href} className="text-[var(--fg-muted)] hover:text-brand-700 transition-colors">
                        {item.label}
                      </Link>
                    ) : (
                      <span className={last ? "font-semibold text-[var(--fg-primary)]" : "text-[var(--fg-muted)]"}>
                        {item.label}
                      </span>
                    )}
                    {!last && <ChevronRight size={14} className="text-[var(--fg-muted)]" />}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <h1 className="text-h1 text-[var(--fg-primary)] tracking-tight">{title}</h1>
        {description && (
          <p className="text-body-lg text-[var(--fg-secondary)] max-w-3xl leading-relaxed">{description}</p>
        )}
      </div>
    </section>
  );
}
