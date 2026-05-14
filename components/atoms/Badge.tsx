import { clsx } from "@/lib/clsx";

export type BadgeColor = "discount" | "preorder" | "bestseller" | "stockout";
export type BadgeStyle = "solid" | "soft" | "outline";
export type BadgePlacement =
  | "inline"
  | "corner-tl"
  | "corner-tr"
  | "corner-bl"
  | "corner-br";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  variant?: BadgeStyle;
  placement?: BadgePlacement;
}

const styleClass: Record<BadgeStyle, Record<BadgeColor, string>> = {
  solid: {
    discount: "badge-solid-discount",
    preorder: "badge-solid-preorder",
    bestseller: "badge-solid-bestseller",
    stockout: "badge-solid-stockout",
  },
  soft: {
    discount: "badge-soft-discount",
    preorder: "badge-soft-preorder",
    bestseller: "badge-soft-bestseller",
    stockout: "badge-soft-stockout",
  },
  outline: {
    discount: "badge-outline-discount",
    preorder: "badge-outline-preorder",
    bestseller: "badge-outline-bestseller",
    stockout: "badge-outline-stockout",
  },
};

const placementClass: Record<BadgePlacement, string> = {
  inline: "",
  "corner-tl": "badge-corner-tl",
  "corner-tr": "badge-corner-tr",
  "corner-bl": "badge-corner-bl",
  "corner-br": "badge-corner-br",
};

export function Badge({
  color = "discount",
  variant = "solid",
  placement = "inline",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "badge",
        styleClass[variant][color],
        placementClass[placement],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
