"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Logo, Button } from "@/components/atoms";
import { SearchBar } from "@/components/molecules";
import { clsx } from "@/lib/clsx";

export interface HeaderProps {
  cartCount?: number;
  className?: string;
}

export function Header({ cartCount = 0, className }: HeaderProps) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 w-full bg-[var(--bg-surface)] border-b border-[var(--border-default)]",
        className,
      )}
    >
      <div className="container-site flex items-center gap-3 sm:gap-6 h-16 sm:h-20">
        <Logo size="md" />

        <form className="flex-1 max-w-2xl mx-2 hidden sm:block" onSubmit={submitSearch} role="search">
          <SearchBar value={q} onChange={(e) => setQ(e.target.value)} />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/cart"
            aria-label={`Cart (${cartCount} items)`}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-[var(--bg-surface-muted)] transition-colors"
          >
            <ShoppingBag size={22} className="text-[var(--fg-primary)]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-discount-600 text-white text-caption font-bold inline-flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <Button href="/login" variant="primary" size="md">
            Login/Register
          </Button>
        </div>
      </div>

      <form className="container-site pb-3 sm:hidden" onSubmit={submitSearch} role="search">
        <SearchBar value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
    </header>
  );
}
