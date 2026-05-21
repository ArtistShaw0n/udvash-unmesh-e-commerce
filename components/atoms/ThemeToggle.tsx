"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { clsx } from "@/lib/clsx";

type Theme = "light" | "dark";

function readInitialTheme(): Theme {
  // Default is light — the Figma design is authored in light values
  // only. Honour an explicit user choice from localStorage but don't
  // auto-flip on `prefers-color-scheme: dark`. This matches the
  // theme-init script in app/layout.tsx that runs before hydration.
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("theme") as Theme | null;
    return stored === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export interface ThemeToggleProps {
  /** Extra classes — use to add a border, custom size, etc. */
  className?: string;
  /**
   * "icon" (default) — square icon-only button, matches header action cluster.
   * "nav" — icon stacked above a "থিম" label, matches MobileBottomNav items.
   */
  variant?: "icon" | "nav";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Re-read in case the inline script ran before React (avoids a
    // flicker when localStorage differs from the SSR default of "light").
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  function toggle() {
    setTheme(isDark ? "light" : "dark");
  }

  if (variant === "nav") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className={clsx(
          "flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[48px] text-caption transition-colors text-[var(--fg-muted)] hover:text-[var(--fg-primary)] w-full",
          className,
        )}
      >
        <span className="relative inline-flex">
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="text-[10px] font-semibold leading-none">থিম</span>
      </button>
    );
  }

  // "icon" variant — matches other header action buttons.
  // Pre-mount: render an empty placeholder so layout width doesn't shift.
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={clsx(
          "inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md",
          className,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className={clsx(
        "inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md text-[var(--fg-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors",
        className,
      )}
    >
      <Icon size={20} className="sm:hidden" aria-hidden="true" />
      <Icon size={22} className="hidden sm:block" aria-hidden="true" />
    </button>
  );
}
