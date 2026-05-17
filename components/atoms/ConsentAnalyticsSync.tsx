"use client";

import { useEffect } from "react";
import { useConsent } from "@/lib/consent-context";
import { setAnalyticsConsent } from "@/lib/analytics";

/**
 * Bridges the consent context to the analytics module so events
 * automatically respect the user's category choices.
 */
export function ConsentAnalyticsSync() {
  const { consent } = useConsent();
  useEffect(() => {
    setAnalyticsConsent(consent);
  }, [consent]);
  return null;
}
