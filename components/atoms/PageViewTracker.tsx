"use client";

import { Suspense } from "react";
import { usePageView } from "@/lib/use-page-view";

/**
 * Mounts the page-view hook. Wrapped in Suspense because
 * useSearchParams() needs a suspense boundary above it.
 */
export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  usePageView();
  return null;
}
