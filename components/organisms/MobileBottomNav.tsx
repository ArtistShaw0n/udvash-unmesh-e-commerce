"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, User, Package } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { clsx } from "@/lib/clsx";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
}

/**
 * Bottom-anchored navigation rail for mobile. Hidden on sm+ where the
 * full header is roomy. Floats above content; respects safe-area-inset
 * for iOS notches.
 */
export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const { itemCount } = useCart();
  const { isLoggedIn } = useAuth();

  const items: NavItem[] = [
    { label: "হোম", href: "/", icon: Home },
    { label: "সার্চ", href: "/search", icon: Search },
    { label: "অর্ডার", href: isLoggedIn ? "/account/orders" : "/orders/track", icon: Package },
    { label: "কার্ট", href: "/cart", icon: ShoppingCart, badge: itemCount },
    {
      label: "একাউন্ট",
      href: isLoggedIn ? "/account" : "/login",
      icon: User,
    },
  ];

  // Hide on admin / auth pages so it doesn't fight with their layouts
  const hide =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/verify-email" ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");
  if (hide) return null;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--bg-surface)] border-t border-[var(--border-default)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ label, href, icon: Icon, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-caption transition-colors",
                  active
                    ? "text-brand-700 dark:text-brand-400"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]",
                )}
              >
                <span className="relative inline-flex">
                  <Icon size={20} />
                  {badge != null && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[1rem] h-4 px-1 rounded-full bg-discount-600 text-white text-[10px] font-bold inline-flex items-center justify-center">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-semibold leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
