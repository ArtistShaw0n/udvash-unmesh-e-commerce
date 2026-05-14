"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function Dropdown({
  options,
  value,
  defaultValue,
  onChange,
  label,
  placeholder = "Select",
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<string | undefined>(
    defaultValue ?? value,
  );
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedValue = value ?? internal;
  const selected = options.find((o) => o.value === selectedValue);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(v: string) {
    if (value === undefined) setInternal(v);
    onChange?.(v);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={clsx("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center justify-between gap-2 min-w-[140px] px-4 py-2.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-body-sm text-[var(--fg-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <span className="truncate">
          {label && <span className="text-[var(--fg-muted)]">{label}: </span>}
          <span className="font-medium">
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={clsx("flex-shrink-0 text-[var(--fg-muted)] transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 min-w-full w-max z-20 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card-hover py-1 overflow-hidden"
        >
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => pick(opt.value)}
                  className={clsx(
                    "w-full flex items-center justify-between gap-3 px-4 py-2 text-body-sm text-left hover:bg-[var(--bg-surface-muted)] transition-colors",
                    isSelected
                      ? "text-brand-700 dark:text-brand-400 font-semibold"
                      : "text-[var(--fg-primary)]",
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={16} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
