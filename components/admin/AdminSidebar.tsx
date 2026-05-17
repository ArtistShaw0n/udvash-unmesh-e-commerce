"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  RotateCcw,
  Star,
  Tag,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/atoms";
import { useAuth } from "@/lib/auth-context";
import { clsx } from "@/lib/clsx";

const NAV = [
  { label: "ড্যাশবোর্ড", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "অর্ডার", href: "/admin/orders", icon: Package },
  { label: "ইনভেন্টরি", href: "/admin/inventory", icon: Boxes },
  { label: "কাস্টমার", href: "/admin/customers", icon: Users },
  { label: "রিটার্ন", href: "/admin/returns", icon: RotateCcw },
  { label: "রিভিউ", href: "/admin/reviews", icon: Star },
  { label: "কুপন", href: "/admin/coupons", icon: Tag },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        className="lg:hidden fixed top-3 left-3 z-30 inline-flex items-center justify-center w-10 h-10 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-card"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 z-40 w-64 h-screen border-r border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-muted)]">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close admin menu"
            className="lg:hidden w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-[var(--bg-surface-muted)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-[var(--border-muted)]">
          <p className="text-caption font-bold uppercase tracking-wider text-[var(--fg-muted)]">
            অ্যাডমিন
          </p>
          <p className="text-body-sm font-semibold text-[var(--fg-primary)] truncate mt-1">
            {user?.name}
          </p>
          <p className="text-caption text-[var(--fg-muted)] truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {NAV.map(({ label, href, icon: Icon, exact }) => {
              const active = exact
                ? pathname === href
                : pathname?.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
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
          </ul>
        </nav>

        <div className="p-2 border-t border-[var(--border-muted)]">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm text-[var(--fg-secondary)] hover:bg-[var(--bg-surface-muted)] hover:text-[var(--fg-primary)] transition-colors"
          >
            ← স্টোরে ফিরে যান
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-body-sm font-semibold text-discount-600 hover:bg-discount-50 dark:hover:bg-discount-900/20 transition-colors"
          >
            <LogOut size={18} />
            লগআউট
          </button>
        </div>
      </aside>
    </>
  );
}
