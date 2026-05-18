"use client";

import { useState } from "react";
import { FilterPill } from "@/components/atoms";
import { SectionHeader } from "@/components/molecules";
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

  // Section header typography from the Figma export
  // (Frame 1597882745 group):
  //   Title    Poppins 30px / 36px weight 600, letter-spacing -0.354px,
  //            text-transform capitalize, color #3D3D3D
  //   Subtitle Inter 14px / 20px weight 400, letter-spacing -0.150px,
  //            color #676767
  return (
    // Figma §3: the home-page category filter sits on a full-bleed WHITE
    // band (matches Hero above and Flash-Sale below). Explicit
    // bg-surface so it doesn't pick up the cream page bg behind it.
    <section
      data-figma-id="9:5420"
      className={clsx("section-pad-sm bg-[var(--bg-surface)]", className)}
    >
      <div className="container-site">
        {variant === "centered" && (
          <SectionHeader title={title} subtitle={subtitle} align="center" />
        )}
        {variant === "compact" && (
          // Compact variant is smaller (24px max) — used inside dense
          // toolbars where the standard SectionHeader size would crowd
          // the page. Kept inline for now; if a second `compact` user
          // appears, extract into the SectionHeader molecule.
          <h2 className="font-poppins font-semibold text-[20px] sm:text-[24px] leading-9 text-center text-[var(--color-text-title)] dark:text-[var(--fg-primary)] mb-6">
            {title}
          </h2>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categories.map((c) => (
            <FilterPill
              key={c.slug}
              active={c.slug === active}
              size={variant === "centered" ? "default" : "compact"}
              onClick={() => handle(c.slug)}
            >
              {c.label}
            </FilterPill>
          ))}
        </div>
      </div>
    </section>
  );
}
