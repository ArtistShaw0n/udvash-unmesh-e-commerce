import Link from "next/link";
import { clsx } from "@/lib/clsx";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "warning"
  | "danger"
  | "ghost"
  | "white";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Responsive size — pick a different button size per breakpoint.
 *
 * - Pass a string ("sm" | "md" | "lg") to apply everywhere.
 * - Pass an object to override at each breakpoint. Tailwind breakpoints used:
 *     base = 0+, sm = 640+, md = 768+, lg = 1024+, xl = 1280+.
 *
 * Example:
 *   <Button size={{ base: "sm", md: "md" }}> → sm on mobile, md on tablet+
 */
export type ResponsiveSize =
  | ButtonSize
  | Partial<{
      base: ButtonSize;
      sm: ButtonSize;
      md: ButtonSize;
      lg: ButtonSize;
      xl: ButtonSize;
    }>;

type CommonProps = {
  variant?: ButtonVariant;
  size?: ResponsiveSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

type AsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type AsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = AsButton | AsLink;

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap";

/**
 * Static class table. Tailwind's JIT scanner sees the full literal strings,
 * so the responsive variants below survive purge.
 */
const sizeClass: Record<
  ButtonSize,
  { base: string; sm: string; md: string; lg: string; xl: string }
> = {
  sm: {
    base: "text-body-sm px-3.5 py-2",
    sm: "sm:text-body-sm sm:px-3.5 sm:py-2",
    md: "md:text-body-sm md:px-3.5 md:py-2",
    lg: "lg:text-body-sm lg:px-3.5 lg:py-2",
    xl: "xl:text-body-sm xl:px-3.5 xl:py-2",
  },
  md: {
    base: "text-body px-5 py-2.5",
    sm: "sm:text-body sm:px-5 sm:py-2.5",
    md: "md:text-body md:px-5 md:py-2.5",
    lg: "lg:text-body lg:px-5 lg:py-2.5",
    xl: "xl:text-body xl:px-5 xl:py-2.5",
  },
  lg: {
    base: "text-body-lg px-6 py-3.5",
    sm: "sm:text-body-lg sm:px-6 sm:py-3.5",
    md: "md:text-body-lg md:px-6 md:py-3.5",
    lg: "lg:text-body-lg lg:px-6 lg:py-3.5",
    xl: "xl:text-body-lg xl:px-6 xl:py-3.5",
  },
};

function resolveSize(size: ResponsiveSize | undefined): string {
  if (!size) return sizeClass.md.base;
  if (typeof size === "string") return sizeClass[size].base;
  const parts: string[] = [];
  if (size.base) parts.push(sizeClass[size.base].base);
  if (size.sm) parts.push(sizeClass[size.sm].sm);
  if (size.md) parts.push(sizeClass[size.md].md);
  if (size.lg) parts.push(sizeClass[size.lg].lg);
  if (size.xl) parts.push(sizeClass[size.xl].xl);
  return parts.join(" ");
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-button",
  secondary:
    "bg-transparent text-[var(--fg-primary)] border border-[var(--border-strong)] hover:bg-[var(--bg-surface-muted)]",
  warning:
    "bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700",
  danger:
    "bg-discount-600 text-white hover:bg-discount-700 active:bg-discount-800",
  ghost:
    "bg-transparent text-[var(--fg-primary)] hover:bg-[var(--bg-surface-muted)]",
  white:
    "bg-white text-brand-700 hover:bg-white/90 hover:text-brand-800",
};

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    leftIcon,
    rightIcon,
    className,
    children,
    ...rest
  } = props;

  const classes = clsx(
    base,
    resolveSize(size),
    variantClass[variant],
    fullWidth && "w-full",
    className,
  );

  const inner = (
    <>
      {leftIcon}
      {children}
      {rightIcon}
    </>
  );

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as AsLink;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {inner}
      </Link>
    );
  }
  const { type = "button", ...buttonRest } = rest as AsButton;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {inner}
    </button>
  );
}
