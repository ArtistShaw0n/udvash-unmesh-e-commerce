import { ShoppingCart } from "lucide-react";
import { clsx } from "@/lib/clsx";

export type CartIconButtonSize = "sm" | "md" | "lg";

export interface CartIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: CartIconButtonSize;
}

const sizeClass: Record<CartIconButtonSize, { box: string; icon: number }> = {
  sm: { box: "w-9 h-9", icon: 16 },
  md: { box: "w-10 h-10", icon: 18 },
  lg: { box: "w-12 h-12", icon: 20 },
};

/**
 * Small square button with cart-add icon. Companion to the primary CTA in
 * ProductCard and ProductDetail bottom rows — adds the item to cart without
 * navigating away.
 */
export function CartIconButton({
  size = "sm",
  className,
  type = "button",
  ...rest
}: CartIconButtonProps) {
  const sz = sizeClass[size];
  return (
    <button
      type={type}
      aria-label="Add to cart"
      className={clsx(
        "inline-flex items-center justify-center flex-shrink-0 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--fg-secondary)] hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 dark:hover:bg-brand-700/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        sz.box,
        className,
      )}
      {...rest}
    >
      <ShoppingCart size={sz.icon} />
    </button>
  );
}
