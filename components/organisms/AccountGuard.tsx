"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Client-side gate for the /account section. If the user isn't logged in,
 * redirects to /login?next=<current-path>. While we don't know yet (pre-hydration
 * or during the redirect) we render a stable skeleton so SSR/CSR markup is in sync.
 */
export function AccountGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/account";
  const { isLoggedIn, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, isLoggedIn, pathname, router]);

  if (!hydrated || !isLoggedIn) {
    return (
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-card min-h-[40vh]" />
    );
  }

  return <>{children}</>;
}
