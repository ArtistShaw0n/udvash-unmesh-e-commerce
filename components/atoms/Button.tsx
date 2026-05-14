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

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
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

const sizeClass: Record<ButtonSize, string> = {
  sm: "text-body-sm px-3.5 py-2",
  md: "text-body px-5 py-2.5",
  lg: "text-body-lg px-6 py-3.5",
};

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
    sizeClass[size],
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
