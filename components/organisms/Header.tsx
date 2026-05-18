"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, User as UserIcon, ChevronDown, LogOut, Package, Shield } from "lucide-react";
import { Logo, Button } from "@/components/atoms";
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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Close menu on outside-click / Escape. On Escape, restore focus to
  // the trigger (so keyboard users land back where they started).
  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", onPointer);
      document.addEventListener("keydown", onKey);
      // Focus the first interactive item in the menu so screen-reader
      // users can navigate into it immediately after opening.
      const firstItem = menuRef.current?.querySelector<HTMLElement>(
        '[role="menuitem"], a, button',
      );
      // Skip the trigger itself if it happens to be inside menuRef
      if (firstItem && firstItem !== triggerRef.current) {
        firstItem.focus();
      }
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
        // Figma renders the header on the same white band as the hero
        // wrapper (section §1 in Figma). Keep it explicit so it doesn't
        // change colour when the global --bg-page token shifts.
        "sticky top-0 z-40 w-full bg-[var(--bg-surface)] border-b border-[#E8EEF4] dark:border-[var(--border-default)]",
        className,
      )}
    >
      <div className="container-site flex items-center gap-3 sm:gap-6 h-14 sm:h-16 md:h-20">
        {/* Logo shrinks on mobile so the right-side CTA fits */}
        <Logo size="md" className="!h-7 sm:!h-8 md:!h-9" />

        <div className="flex-1 max-w-2xl mx-2 hidden sm:block">
          <SearchAutocomplete />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
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

          {!authHydrated ? (
            // Stable placeholder so SSR and CSR widths match (responsive width).
            <div className="w-24 sm:w-32 h-9 sm:h-10 rounded-md bg-[var(--bg-surface-muted)] animate-pulse" />
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
