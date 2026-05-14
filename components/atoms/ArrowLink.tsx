import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clsx } from "@/lib/clsx";

type CommonProps = {
  className?: string;
  children?: React.ReactNode;
  iconSize?: number;
};

type AsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

type AsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

export type ArrowLinkProps = AsLink | AsButton;

export function ArrowLink(props: ArrowLinkProps) {
  const { className, children, iconSize = 16, ...rest } = props;

  const classes = clsx(
    "group inline-flex items-center gap-1.5 text-body-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors",
    className,
  );

  const inner = (
    <>
      <span>{children}</span>
      <ArrowRight
        size={iconSize}
        className="transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
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
  const { type = "button", ...btnRest } = rest as AsButton;
  return (
    <button type={type} className={classes} {...btnRest}>
      {inner}
    </button>
  );
}
