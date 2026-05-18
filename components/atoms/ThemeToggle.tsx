"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

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

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[var(--border-default)]"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--fg-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
