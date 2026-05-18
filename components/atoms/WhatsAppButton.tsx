"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { clsx } from "@/lib/clsx";
import { SITE_WHATSAPP } from "@/lib/site";

const PRESETS = [
  { label: "অর্ডার করতে চাই", message: "হ্যালো! আমি একটি অর্ডার করতে চাই।" },
  { label: "Bulk অর্ডার (১০+ বই)", message: "হ্যালো! আমি bulk অর্ডার করতে চাই। ডিটেইলস লাগবে।" },
  { label: "ডেলিভারি স্ট্যাটাস", message: "হ্যালো! আমার অর্ডারের ডেলিভারি স্ট্যাটাস জানতে চাই।" },
  { label: "অন্য সাহায্য", message: "হ্যালো! আমার একটি সাহায্য দরকার।" },
];

function buildLink(message: string): string {
  const num = SITE_WHATSAPP.replace(/[^\d]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

/**
 * Floating WhatsApp chat button. Bottom-right corner, opens a preset chooser
 * when clicked. Each preset opens WhatsApp with a pre-filled message.
 *
 * Hidden in the design-system route to avoid clutter while inspecting tokens.
 */
export function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[59] bg-black/20 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* On mobile the MobileBottomNav is ~64px tall along the bottom edge,
          so anchor the WhatsApp FAB above it. Also respect iOS safe-area
          (notch / home indicator) via env(safe-area-inset-bottom). */}
      <div className="fixed right-4 sm:right-6 z-[60] flex flex-col items-end gap-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {open && (
          <div
            role="dialog"
            aria-label="Chat presets"
            className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card-hover p-3 w-72 max-w-[calc(100vw-2rem)]"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-body-sm font-semibold text-[var(--fg-primary)]">
                সাহায্য চাই
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-6 h-6 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--bg-surface-muted)]"
              >
                <X size={14} />
              </button>
            </div>
            <ul className="space-y-1">
              {PRESETS.map((p) => (
                <li key={p.label}>
                  <a
                    href={buildLink(p.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-body-sm text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--fg-primary)] transition-colors"
                  >
                    <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-[#25D366] text-white">
                      <WhatsAppLogo size={14} />
                    </span>
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-caption text-[var(--fg-muted)] mt-2 px-3 pb-1">
              উত্তর দিতে সাধারণত ১৫ মিনিট লাগে
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close chat options" : "Open WhatsApp chat"}
          aria-expanded={open}
          className={clsx(
            "inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-card-hover transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "bg-[#25D366] text-white focus-visible:ring-[#25D366]",
            open && "rotate-90",
          )}
        >
          {open ? <X size={22} /> : <MessageCircle size={24} fill="white" strokeWidth={0} />}
        </button>
      </div>
    </>
  );
}

function WhatsAppLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
