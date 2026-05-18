import Link from "next/link";
import { Palette } from "lucide-react";

/**
 * Floating, fixed-position button that links to the internal /design-system
 * route. Visible on every public page via the marketing layout.
 */
export function FloatingDesignSystemButton() {
  return (
    <Link
      href="/design-system"
      aria-label="Open Design System"
      title="Design System"
      // Stack above the WhatsApp button. On mobile WA sits 5rem above the
      // safe-area; this FAB needs to clear another 56px + 16px gap above
      // that. On sm+ WA sits 1.5rem above safe-area; this FAB needs to
      // clear ~88px (FAB height + gap) above that.
      className="
        fixed right-4 sm:right-6 z-50
        bottom-[calc(9rem+env(safe-area-inset-bottom))] sm:bottom-[calc(7rem+env(safe-area-inset-bottom))]
        inline-flex items-center justify-center
        w-12 h-12 sm:w-14 sm:h-14
        rounded-full
        bg-brand-700 text-white
        shadow-card-hover hover:bg-brand-800
        transition-all hover:scale-105 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
      "
    >
      <Palette size={22} aria-hidden="true" />
    </Link>
  );
}
