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
  const inactive =
    tone === "onDark" ? "bg-white/40 hover:bg-white/60" : "bg-neutral-300 hover:bg-neutral-400";
  const activeCls = tone === "onDark" ? "bg-white" : "bg-brand-700";

  return (
    <div
      className={clsx("flex items-center gap-1.5", className)}
      role="tablist"
      aria-label="Carousel slides"
    >
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        const sizeCls = isActive ? clsx("w-6", activeCls) : clsx("w-1.5", inactive);
        const baseCls = clsx("h-1.5 rounded-full transition-all", sizeCls);

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
