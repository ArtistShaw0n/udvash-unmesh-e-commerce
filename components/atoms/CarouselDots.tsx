import { clsx } from "@/lib/clsx";

// Server-component-safe: render <span> when not interactive, <button> when an
// onSelect handler is provided. This avoids passing event handlers from server
// components (which Next.js disallows).

export interface CarouselDotsProps {
  count: number;
  active: number;
  /** On a dark background (hero) the dots are white-tinted. */
  tone?: "onDark" | "onLight";
  onSelect?: (index: number) => void;
  className?: string;
}

export function CarouselDots({
  count,
  active,
  tone = "onDark",
  onSelect,
  className,
}: CarouselDotsProps) {
  // Per Figma spec:
  //   onDark — active 32×8 bg #E5F0F1 (cream-tinted white), inactive 8×8 bg #469097 (mid-teal)
  //   onLight — active 32×8 bg #006D77 (brand), inactive 8×8 bg #E5F0F1 (cream)
  const inactive =
    tone === "onDark" ? "bg-[#469097] hover:bg-[#5aa5ad]" : "bg-[#E5F0F1] hover:bg-neutral-300";
  const activeCls = tone === "onDark" ? "bg-[#E5F0F1]" : "bg-[#006D77]";

  return (
    <div
      className={clsx("flex items-center gap-2", className)}
      role="tablist"
      aria-label="Carousel slides"
    >
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        // active = 32×8, inactive = 8×8, both 4px radius
        const sizeCls = isActive ? clsx("w-8", activeCls) : clsx("w-2", inactive);
        const baseCls = clsx("h-2 rounded transition-all", sizeCls);

        // Render <button> only when interactive (avoids passing event handlers
        // through a server-component boundary).
        if (onSelect) {
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => onSelect(i)}
              className={clsx(baseCls, "cursor-pointer")}
            />
          );
        }
        return (
          <span
            key={i}
            role="presentation"
            aria-current={isActive ? "true" : undefined}
            className={baseCls}
          />
        );
      })}
    </div>
  );
}
