"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/atoms";
import { useConsent } from "@/lib/consent-context";

/**
 * Bottom-anchored cookie consent banner. Visible only when the user has
 * not yet decided. Three actions: Accept all / Reject all / View privacy.
 * Decisions are persisted in localStorage so the banner doesn't reappear.
 */
export function CookieConsentBanner() {
  const { needsDecision, acceptAll, rejectAll } = useConsent();

  if (!needsDecision) return null;

  return (
    <div
      // Non-modal banner — keep aria-live for the update, drop the
      // redundant dialog role (no focus trap, doesn't need to be a dialog).
      aria-live="polite"
      // On mobile, sit above the MobileBottomNav (~64px) + iOS home
      // indicator. On sm+, lift off the bottom edge with safe-area pad.
      className="fixed inset-x-0 z-[55] p-3 sm:p-4 pointer-events-none bottom-[calc(4rem+env(safe-area-inset-bottom))] sm:bottom-[env(safe-area-inset-bottom)]"
    >
      <div className="container-site pointer-events-auto">
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card-hover p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="flex-shrink-0 inline-flex w-10 h-10 items-center justify-center rounded-full bg-warning-50 dark:bg-warning-700/20 text-warning-700 dark:text-warning-300">
            <Cookie size={20} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-body-sm sm:text-body font-semibold text-[var(--fg-primary)]">
              আমরা আপনার অভিজ্ঞতা উন্নত করতে কুকি ব্যবহার করি
            </p>
            <p className="text-caption sm:text-body-sm text-[var(--fg-secondary)] mt-0.5">
              Necessary কুকি সবসময় চালু থাকে। Analytics ও marketing কুকি আপনার অনুমতির পরই চালু হবে।{" "}
              <Link href="/privacy" className="font-semibold underline">
                গোপনীয়তা নীতি
              </Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <Button variant="secondary" size={{ base: "sm", md: "md" }} onClick={rejectAll}>
              শুধু প্রয়োজনীয়
            </Button>
            <Button variant="primary" size={{ base: "sm", md: "md" }} onClick={acceptAll}>
              সব মেনে নিন
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
