"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "./analytics";

/**
 * Fires `page_view` on every client-side route change.
 * Mount once at the top of the app via <PageViewTracker />.
 */
export function usePageView(): void {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.toString();
    const url = pathname + (q ? `?${q}` : "");
    trackPageView(url, typeof document !== "undefined" ? document.title : undefined);
  }, [pathname, searchParams]);
}
