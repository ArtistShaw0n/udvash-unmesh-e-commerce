import { Check } from "lucide-react";
import { clsx } from "@/lib/clsx";

export interface CheckoutStep {
  label: string;
}

export interface CheckoutStepperProps {
  steps: CheckoutStep[];
  current: number;
  className?: string;
}

export function CheckoutStepper({ steps, current, className }: CheckoutStepperProps) {
  return (
    <ol className={clsx("flex items-center justify-center gap-1 sm:gap-2", className)}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={i} className="flex items-center gap-1 sm:gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={clsx(
                "inline-flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-full text-body-sm font-bold",
                done && "bg-brand-600 text-white",
                active && "bg-brand-700 text-white ring-4 ring-brand-100 dark:ring-brand-700/30",
                !done && !active && "bg-[var(--bg-surface-muted)] text-[var(--fg-muted)] border border-[var(--border-default)]",
              )}
            >
              {done ? <Check size={16} /> : i + 1}
            </span>
            <span className={clsx(
              "text-body-sm font-semibold hidden sm:inline",
              active && "text-[var(--fg-primary)]",
              done && "text-brand-700 dark:text-brand-400",
              !done && !active && "text-[var(--fg-muted)]",
            )}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span className={clsx(
                "w-6 sm:w-12 h-0.5",
                done ? "bg-brand-600" : "bg-[var(--border-default)]",
              )} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
