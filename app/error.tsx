"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/atoms";

/**
 * Route-level error boundary. Next.js renders this when a Server / Client
 * component in this segment throws during render. Logs to console for now;
 * once Sentry is wired in lib/analytics, switch the `track` call below.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Real impl: lib/analytics.trackError(error)
    console.error("[route-error]", error);
  }, [error]);

  return (
    <main className="flex-1 flex items-center justify-center section-pad">
      <div className="container-site">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-discount-50 text-discount-700 dark:bg-discount-900/30 dark:text-discount-300">
            <AlertTriangle size={28} />
          </div>
          <h1 className="text-h2 text-[var(--fg-primary)]">কিছু একটা সমস্যা হয়েছে</h1>
          <p className="text-body text-[var(--fg-secondary)]">
            এই পেজটি লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন বা হোমে ফিরে যান।
          </p>
          {error.digest && (
            <p className="text-caption text-[var(--fg-muted)]">
              Error ID: <span className="font-mono">{error.digest}</span>
            </p>
          )}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Button variant="primary" size={{ base: "md", md: "lg" }} onClick={reset}>
              আবার চেষ্টা করুন
            </Button>
            <Button href="/" variant="secondary" size={{ base: "md", md: "lg" }}>
              হোমে ফিরে যান
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
