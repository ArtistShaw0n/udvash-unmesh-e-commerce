"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, User as UserIcon, ChevronDown, LogOut, Package, Shield } from "lucide-react";
import { Logo, Button, ThemeToggle } from "@/components/atoms";
import { SearchAutocomplete } from "@/components/molecules";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import { clsx } from "@/lib/clsx";

export interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const { itemCount, hydrated: cartHydrated } = useCart();
  const { user, hydrated: authHydrated, logout } = useAuth();
  const toast = useToast();

  // Pixel-sampled Figma node 9:5883 across all pages: the header outer
  // band is uniformly #F7F9FB (cream) on every route. The white you
  // see if you sample naively is the search input pill inside the
  // header, not the band itself. So: always cream, no pathname switch.

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Outside-click closes the menu; keyboard navigation inside the menu
  // matches the standard WAI-ARIA menu pattern:
  //   - Escape: close + return focus to the trigger
  //   - ArrowDown / ArrowUp: move focus through menuitems (wrapping)
  //   - Home / End: jump to first / last menuitem
  //   - Tab: closes the menu (treated like a focus-out)
  // The menuitems themselves stay native <a>/<button> so Enter/Space
  // activate them via the default browser behaviour.
  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function getItems(): HTMLElement[] {
      if (!menuRef.current) return [];
      return Array.from(
        menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'),
      );
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }
      // Only intercept arrow keys when focus is inside the menu — don't
      // hijack page-level arrow scrolling otherwise.
      if (!menuRef.current?.contains(document.activeElement)) return;
      const items = getItems();
      if (items.length === 0) return;
      const idx = items.findIndex((el) => el === document.activeElement);
      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = items[(idx + 1) % items.length];
          next?.focus();
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = items[(idx - 1 + items.length) % items.length];
          prev?.focus();
          break;
        }
        case "Home": {
          e.preventDefault();
          items[0]?.focus();
          break;
        }
        case "End": {
          e.preventDefault();
          items[items.length - 1]?.focus();
          break;
        }
        case "Tab":
          // Tab leaves the menu — close so focus doesn't end up stuck
          // inside a hidden dropdown.
          setMenuOpen(false);
          break;
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", onPointer);
      document.addEventListener("keydown", onKey);
      // Focus the first menuitem so SR users navigate into it immediately.
      const items = getItems();
      items[0]?.focus();
    }
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    toast.info("লগআউট হয়েছে");
    router.push("/");
  }

  const showBadge = cartHydrated && itemCount > 0;
  const isLoggedIn = authHydrated && !!user;

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 w-full bg-[var(--bg-page)] border-b border-[#E8EEF4] dark:border-[var(--border-default)]",
        className,
      )}
    >
      {/* 3-column grid keeps the search bar visually centered between
          the logo and the right-side action cluster: outer columns size
          to their content, middle 1fr fills the rest with the search
          bar centred inside (justify-self-center). Width capped at 712
          per Figma node 9:5883. */}
      <div className="container-site grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6 h-14 sm:h-16 md:h-20">
        {/* Logo shrinks on mobile so the right-side CTA fits */}
        <div data-figma-id="header.logo" className="flex-shrink-0">
          <Logo size="md" className="!h-7 sm:!h-8 md:!h-9" />
        </div>

        <div
          data-figma-id="header.search"
          className="hidden sm:block w-full max-w-[712px] justify-self-center"
        >
          <SearchAutocomplete />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/cart"
            aria-label={`Cart (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
            className="relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md hover:bg-[var(--bg-surface-muted)] transition-colors"
          >
            {/* ShoppingBag glyph (per user preference — the tote/bag metaphor
                reads better than the trolley-cart for this brand). Responsive
                size: 20px on mobile, 22px on sm+ so the icon scales with the
                header chrome. */}
            <ShoppingBag size={20} className="text-[var(--fg-primary)] sm:hidden" />
            <ShoppingBag size={22} className="text-[var(--fg-primary)] hidden sm:block" />
            {showBadge && (
              // Figma badge — bg #E02D15 (Tag 1), pill shape, Poppins SemiBold
              // 12, white. Anchored to the icon's top-right corner.
              // aria-hidden because the count is already announced via the
              // Link's aria-label AND the live region below.
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1.5 rounded-pill bg-badge-discount text-white font-poppins font-semibold text-[12px] leading-none inline-flex items-center justify-center"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* Visually-hidden live region that announces cart count changes
              to screen readers. Updates polite-ly so it doesn't interrupt
              other ARIA announcements. */}
          {cartHydrated && (
            <span aria-live="polite" aria-atomic="true" className="sr-only">
              {itemCount === 0
                ? "Cart is empty"
                : `${itemCount} ${itemCount === 1 ? "item" : "items"} in cart`}
            </span>
          )}

          <ThemeToggle />

          {!authHydrated ? (
            // Show Login button during SSR/pre-hydration — replaced by user
            // menu if logged in. A brief layout shift on login is acceptable;
            // an invisible skeleton is not.
            <Button href="/login" variant="primary" size={{ base: "sm", md: "md" }}>
              <span className="sm:hidden">Login</span>
              <span className="hidden sm:inline">Login/Register</span>
            </Button>
          ) : isLoggedIn ? (
            <div ref={menuRef} className="relative">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="inline-flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-1.5 sm:px-3 rounded-md hover:bg-[var(--bg-surface-muted)] transition-colors"
              >
                <span className="inline-flex w-7 h-7 sm:w-8 sm:h-8 items-center justify-center rounded-full bg-brand-600 text-white text-caption sm:text-body-sm font-bold">
                  {user!.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden md:block text-body-sm font-semibold text-[var(--fg-primary)] truncate max-w-[8rem]">
                  {user!.name}
                </span>
                <ChevronDown size={14} className="hidden md:block text-[var(--fg-muted)]" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card-hover p-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-[var(--border-muted)] mb-1">
                    <p className="text-body-sm font-semibold text-[var(--fg-primary)] truncate">{user!.name}</p>
                    <p className="text-caption text-[var(--fg-muted)] truncate">{user!.email}</p>
                  </div>
                  <MenuLink href="/account" icon={<UserIcon size={16} />} onClick={() => setMenuOpen(false)}>
                    ড্যাশবোর্ড
                  </MenuLink>
                  <MenuLink href="/account/orders" icon={<Package size={16} />} onClick={() => setMenuOpen(false)}>
                    আমার অর্ডার
                  </MenuLink>
                  {user!.isAdmin && (
                    <>
                      <div className="my-1 border-t border-[var(--border-muted)]" />
                      <MenuLink href="/admin" icon={<Shield size={16} />} onClick={() => setMenuOpen(false)}>
                        অ্যাডমিন প্যানেল
                      </MenuLink>
                    </>
                  )}
                  <div className="my-1 border-t border-[var(--border-muted)]" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-body-sm font-semibold text-discount-600 hover:bg-discount-50 dark:hover:bg-discount-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    লগআউট
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Responsive CTA: sm on mobile (compact 36px), md on tablet+ (44px)
            <Button
              href="/login"
              variant="primary"
              size={{ base: "sm", md: "md" }}
              data-figma-id="header.cta"
            >
              <span className="sm:hidden">Login</span>
              <span className="hidden sm:inline">Login/Register</span>
            </Button>
          )}
        </div>
      </div>

      <div className="container-site pb-3 sm:hidden">
        <SearchAutocomplete />
      </div>
    </header>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-body-sm text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--fg-primary)] transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}
