"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/atoms";
import { useAuth } from "@/lib/auth-context";

/**
 * Wraps the admin route group. Redirects logged-out users to /login
 * with ?next=/admin/.... Logged-in non-admins see an explanatory page.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/admin";
  const { user, hydrated, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!isLoggedIn) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, isLoggedIn, pathname, router]);

  if (!hydrated || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 shadow-card min-h-[200px]" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 shadow-card text-center space-y-4">
          <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-discount-50 dark:bg-discount-900/30 text-discount-700 dark:text-discount-300">
            <ShieldOff size={28} />
          </div>
          <h1 className="text-h2 text-[var(--fg-primary)]">এই পেজে এক্সেস নেই</h1>
          <p className="text-body text-[var(--fg-secondary)]">
            অ্যাডমিন এক্সেসের জন্য সাইট অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।
          </p>
          <p className="text-caption text-[var(--fg-muted)]">
            লগইন: <span className="font-mono">{user?.email}</span>
          </p>
          <Button href="/" variant="primary" size="md">
            হোমে ফিরে যান
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
