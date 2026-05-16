"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, MapPin, Heart, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { clsx } from "@/lib/clsx";

const ITEMS = [
  { label: "ড্যাশবোর্ড", href: "/account", icon: User, exact: true },
  { label: "আমার অর্ডার", href: "/account/orders", icon: Package },
  { label: "প্রোফাইল", href: "/account/profile", icon: User },
  { label: "ঠিকানা", href: "/account/addresses", icon: MapPin },
  { label: "উইশলিস্ট", href: "/account/wishlist", icon: Heart },
  { label: "সিকিউরিটি", href: "/account/security", icon: Shield },
];

export function AccountSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const toast = useToast();

  function handleLogout() {
    logout();
    toast.info("লগআউট হয়েছে");
    router.push("/");
  }

  return (
    <aside className={clsx("rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 sm:p-3 sticky top-24", className)}>
      <nav>
        <ul className="space-y-1">
          {ITEMS.map(({ label, href, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname?.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm font-semibold transition-colors",
                    active
                      ? "bg-brand-50 text-brand-800 dark:bg-brand-700/20 dark:text-brand-300"
                      : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--fg-primary)]",
                  )}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              </li>
            );
          })}
          <li className="pt-2 mt-2 border-t border-[var(--border-muted)]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm font-semibold text-discount-600 hover:bg-discount-50 dark:hover:bg-discount-900/20 transition-colors"
            >
              <LogOut size={18} />
              লগআউট
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
