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
      // Offset above the WhatsApp button (which lives at bottom-4/right-4
      // with a 56px footprint). Stacking them at the same corner makes
      // the chat icon visually disappear behind the palette icon.
      className="
        fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50
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
