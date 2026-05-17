"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "udvash:consent-v1";

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentState {
  necessary: true;       // Always true — required for the site to function
  analytics: boolean;    // GA4 / Mixpanel
  marketing: boolean;    // FB Pixel / Google Ads
  decidedAt: number | null;
}

const DEFAULT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  decidedAt: null,
};

export interface ConsentContextValue {
  consent: ConsentState;
  hydrated: boolean;
  /** True if the user has not yet decided — banner should be visible. */
  needsDecision: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  /** Partial update (e.g. user adjusted preferences). */
  updateConsent: (patch: Partial<Omit<ConsentState, "necessary" | "decidedAt">>) => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readFromStorage(): ConsentState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      decidedAt: typeof parsed.decidedAt === "number" ? parsed.decidedAt : null,
    };
  } catch {
    return DEFAULT;
  }
}

function persist(state: ConsentState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConsent(readFromStorage());
    setHydrated(true);
  }, []);

  const acceptAll = useCallback(() => {
    const next: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      decidedAt: Date.now(),
    };
    setConsent(next);
    persist(next);
  }, []);

  const rejectAll = useCallback(() => {
    const next: ConsentState = {
      necessary: true,
      analytics: false,
      marketing: false,
      decidedAt: Date.now(),
    };
    setConsent(next);
    persist(next);
  }, []);

  const updateConsent = useCallback(
    (patch: Partial<Omit<ConsentState, "necessary" | "decidedAt">>) => {
      setConsent((prev) => {
        const next: ConsentState = {
          ...prev,
          ...patch,
          necessary: true,
          decidedAt: Date.now(),
        };
        persist(next);
        return next;
      });
    },
    [],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hydrated,
      needsDecision: hydrated && consent.decidedAt === null,
      acceptAll,
      rejectAll,
      updateConsent,
    }),
    [consent, hydrated, acceptAll, rejectAll, updateConsent],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent() must be used within <ConsentProvider>");
  return ctx;
}
