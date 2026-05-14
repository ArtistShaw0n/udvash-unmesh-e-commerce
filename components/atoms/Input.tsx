"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  leftIcon?: React.ReactNode;
  /** Show eye-toggle for password fields. */
  togglePassword?: boolean;
}

export function Input({
  leftIcon,
  togglePassword,
  type = "text",
  className,
  ...rest
}: InputProps) {
  const [revealed, setRevealed] = useState(false);
  const inputType = togglePassword ? (revealed ? "text" : "password") : type;

  return (
    <div
      className={clsx(
        "relative flex items-center w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-colors",
        className,
      )}
    >
      {leftIcon && (
        <span className="pl-4 text-[var(--fg-muted)] flex items-center pointer-events-none">
          {leftIcon}
        </span>
      )}
      <input
        type={inputType}
        className={clsx(
          "flex-1 bg-transparent px-3 py-3 text-body text-[var(--fg-primary)] placeholder:text-[var(--fg-muted)] outline-none",
          leftIcon ? "pl-3" : "pl-4",
          togglePassword ? "pr-12" : "pr-4",
        )}
        {...rest}
      />
      {togglePassword && (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide password" : "Show password"}
          className="absolute right-3 text-[var(--fg-muted)] hover:text-[var(--fg-primary)] p-1"
        >
          {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}
