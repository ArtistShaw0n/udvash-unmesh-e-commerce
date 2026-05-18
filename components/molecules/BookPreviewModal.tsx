"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface BookPreviewModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional preview image. Falls back to a printed placeholder. */
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
}

/**
 * BookPreviewModal — Figma node 9:4879.
 *
 *   Backdrop      black 50%, blur ~2px, fixed full-screen
 *   Modal         centered, max-w 600 on lg+, scales down on smaller
 *                 viewports, bg white, rounded-lg, shadow-card-hover
 *   Close btn     top-right, 32×32, X icon
 *   Inner         aspect 3/4 image area showing a preview spread / TOC
 *                 page of the book
 *
 * Triggered by the "একটু পড়ুন (প্রিভিউ)" button on the product detail
 * page. Closes on backdrop click, Escape, or the × button.
 */
export function BookPreviewModal({
  open,
  onClose,
  imageSrc,
  imageAlt = "Book preview",
  title = "Book preview",
}: BookPreviewModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Lock body scroll + Escape-to-close + focus the close button on open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      {/* Modal */}
      <div
        className={clsx(
          "relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto",
          "rounded-lg bg-white dark:bg-[var(--bg-surface)] shadow-card-hover",
          "p-3 sm:p-4",
        )}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-2 right-2 z-10 inline-flex w-8 h-8 items-center justify-center rounded-full bg-white text-[var(--fg-primary)] shadow-card hover:bg-[var(--bg-surface-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <X size={18} />
        </button>

        <div className="relative aspect-[3/4] w-full rounded-md overflow-hidden bg-[var(--bg-surface-muted)] border border-[var(--border-default)]">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <PreviewPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewPlaceholder() {
  // Faux table-of-contents page that looks plausibly like a book preview
  // when no real image asset is available.
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-[var(--fg-muted)]">
      <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-700/30 flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-700 dark:text-brand-300"
          aria-hidden="true"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
      <p className="text-body-sm font-semibold text-[var(--fg-primary)]">
        প্রিভিউ আসছে শীঘ্রই
      </p>
      <p className="text-caption max-w-[220px]">
        এই বইয়ের প্রিভিউ পেইজ শীঘ্রই যুক্ত হবে — অপেক্ষা করুন।
      </p>
    </div>
  );
}
