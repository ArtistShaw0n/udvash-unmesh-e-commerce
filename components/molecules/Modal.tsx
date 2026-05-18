"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface ModalProps {
  /** Whether the modal is currently shown. */
  open: boolean;
  /** Called when the user presses Escape, clicks the backdrop, or hits the X. */
  onClose: () => void;
  /** Heading shown at the top of the modal. Also wired to aria-labelledby. */
  title: string;
  /** Optional className extension for the dialog panel. */
  className?: string;
  children: React.ReactNode;
}

/**
 * Modal — accessible dialog molecule.
 *
 * Two pages in this app render destructive flows behind a generic
 * "Modal" wrapper (address edit/delete, order cancel/return). They
 * previously rolled their own inline implementations that all missed
 * the basics:
 *
 *   - no Escape handler
 *   - no focus trap (Tab cycles out of the dialog)
 *   - no `aria-labelledby` (the h3 had no id)
 *   - no focus return when the modal closes
 *   - no body-scroll lock
 *
 * This molecule consolidates all of that, modelled on the pattern in
 * `BookPreviewModal`. Use it for any new modal flow; refactor the two
 * existing usages to it (done in the same commit as this file lands).
 *
 * Caller responsibility:
 *   - manage the `open` state externally and pass `onClose`
 *   - the modal returns focus to whatever element was focused before
 *     it opened — that's typically the trigger button. If you need to
 *     focus a specific element after close, do it in your onClose handler.
 */
export function Modal({ open, onClose, title, className, children }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Capture the currently-focused element when opening so we can restore
  // it on close. Lock body scroll. Wire Escape.
  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first interactive element inside the panel so screen-
    // reader users land inside the dialog.
    requestAnimationFrame(() => {
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusables?.[0];
      first?.focus();
    });

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      // Focus trap: when Tab/Shift+Tab would leave the panel, wrap.
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      // Restore focus to whatever the user was on before opening.
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "w-full max-w-md max-h-[90vh] overflow-y-auto rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-card-hover p-5 sm:p-6 space-y-4",
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <h3 id={titleId} className="text-h3 text-[var(--fg-primary)]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
