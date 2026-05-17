import { clsx } from "@/lib/clsx";

export type IconBoxSize = "sm" | "md" | "lg";
export type IconBoxTone = "brand" | "neutral";

export interface IconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: IconBoxSize;
  tone?: IconBoxTone;
  icon: React.ReactNode;
}

const sizeClass: Record<IconBoxSize, string> = {
  sm: "w-9 h-9 rounded-md",
  md: "w-11 h-11 rounded-md",
  lg: "w-14 h-14 rounded-md",
};

const toneClass: Record<IconBoxTone, string> = {
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300",
  neutral: "bg-[var(--bg-surface-muted)] text-[var(--fg-secondary)]",
};

export function IconBox({
  size = "md",
  tone = "brand",
  icon,
  className,
  ...rest
}: IconBoxProps) {
  return (
    <div
      className={clsx(
        "inline-flex items-center justify-center flex-shrink-0",
        sizeClass[size],
        toneClass[tone],
        className,
      )}
      {...rest}
    >
      {icon}
    </div>
  );
}
