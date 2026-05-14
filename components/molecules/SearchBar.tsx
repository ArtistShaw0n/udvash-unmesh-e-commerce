"use client";

import { Search } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface SearchBarProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchBar({
  placeholder = "যেকোনো বই, খাতা ও অন্যান্য খুঁজুন...",
  className,
  containerClassName,
  ...rest
}: SearchBarProps) {
  return (
    <div
      className={clsx(
        "relative flex items-center w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500",
        containerClassName,
      )}
    >
      <span className="pl-4 text-[var(--fg-muted)] flex items-center pointer-events-none">
        <Search size={18} />
      </span>
      <input
        type="search"
        placeholder={placeholder}
        className={clsx(
          "flex-1 bg-transparent px-3 py-2.5 text-body text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] outline-none",
          className,
        )}
        {...rest}
      />
    </div>
  );
}
