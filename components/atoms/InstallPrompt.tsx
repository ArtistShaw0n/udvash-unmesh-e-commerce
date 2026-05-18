"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "./Button";

const DISMISSED_KEY = "udvash:install-prompt-dismissed-v1";

// minimal BeforeInstallPromptEvent typing (Chromium-only API not in lib.dom)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/**
 * In-app PWA install prompt. Captures the browser's beforeinstallprompt
 * event, shows a styled toast offering the install. Persists a dismissal
 * flag so users aren't pestered repeatedly.
 *
 * No-op on iOS Safari (which doesn't fire the event) — those users
 * install via Share → Add to Home Screen.
 */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISSED_KEY)) return;

    function handler(e: Event) {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      // small delay so the prompt doesn't slam in immediately on first visit
      setTimeout(() => setVisible(true), 4000);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!evt) return;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
  }

  function dismiss() {
    setVisible(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    }
  }

  if (!visible || !evt) return null;

  return (
    <div
      role="dialog"
      aria-label="Install app"
      // Stack above the MobileBottomNav + CookieConsentBanner on mobile;
      // on sm+ sit just above the WhatsApp FAB. Both branches respect
      // iOS safe-area-inset-bottom so the home-indicator doesn't clip it.
      className="fixed left-3 right-3 sm:left-auto sm:right-6 sm:w-[360px] z-[58] bottom-[calc(8rem+env(safe-area-inset-bottom))] sm:bottom-[calc(6rem+env(safe-area-inset-bottom))] rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card-hover p-4 flex items-start gap-3"
    >
      <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300 flex-shrink-0">
        <Download size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-[var(--fg-primary)]">
          উদ্ভাস ইনস্টল করুন
        </p>
        <p className="text-caption text-[var(--fg-secondary)] mt-0.5">
          আপনার ডিভাইসে অ্যাপ হিসেবে ইনস্টল করুন — দ্রুত access, offline browsing।
        </p>
        <div className="flex gap-2 mt-2">
          <Button variant="primary" size="sm" onClick={install}>
            ইনস্টল করুন
          </Button>
          <Button variant="ghost" size="sm" onClick={dismiss}>
            পরে
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="flex-shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-md text-[var(--fg-muted)] hover:bg-[var(--bg-surface-muted)]"
      >
        <X size={14} />
      </button>
    </div>
  );
}
