"use client";

import { useState } from "react";
import { FilterPill } from "@/components/atoms";
import { clsx } from "@/lib/clsx";

export interface CategoryFilterSectionProps {
  title: string;
  subtitle?: string;
  categories: { slug: string; label: string }[];
  defaultCategory?: string;
  onChange?: (slug: string) => void;
  /** Show centered title block (Home) vs simple horizontal pills row (Listing). */
  variant?: "centered" | "compact";
  className?: string;
}

export function CategoryFilterSection({
  title,
  subtitle,
  categories,
  defaultCategory,
  onChange,
  variant = "centered",
  className,
}: CategoryFilterSectionProps) {
  const [active, setActive] = useState(defaultCategory ?? categories[0]?.slug);

  function handle(slug: string) {
    setActive(slug);
    onChange?.(slug);
  }

  return (
    <section className={clsx("section-pad-sm", className)}>
      <div className="container-site">
        {variant === "centered" && (
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-h2 text-[var(--fg-primary)]">{title}</h2>
            {subtitle && <p className="text-body text-[var(--fg-secondary)]">{subtitle}</p>}
          </div>
        )}
        {variant === "compact" && (
          <h2 className="text-h2 text-center text-[var(--fg-primary)] mb-6">{title}</h2>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((c) => (
            <FilterPill key={c.slug} active={c.slug === active} onClick={() => handle(c.slug)}>
              {c.label}
            </FilterPill>
          ))}
        </div>
      </div>
    </section>
  );
}
