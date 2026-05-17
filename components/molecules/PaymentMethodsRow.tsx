import Image from "next/image";
import { clsx } from "@/lib/clsx";

/**
 * Payment methods strip rendered from a single high-quality PNG that
 * carries the real brand logos (VISA, Mastercard, JCB, bKash, Nagad,
 * Rocket, the local banks, etc.) plus the SSLCommerz "Verified by"
 * badge at the right end.
 *
 * The asset is `public/footer/payments.png` (1240×39). On desktop it
 * renders at native intrinsic width; on narrower viewports the
 * containing div scrolls horizontally so nothing gets squashed.
 *
 * Previously this was a row of text chips ("VISA", "MC", "AmEx", ...)
 * because we didn't have brand-logo assets. Once the real strip arrived,
 * the chip approach was replaced.
 */
export interface PaymentMethodsRowProps {
  className?: string;
}

export function PaymentMethodsRow({ className }: PaymentMethodsRowProps) {
  return (
    <div
      className={clsx(
        "rounded-md bg-white/95 px-3 py-3 overflow-x-auto",
        className,
      )}
    >
      <div className="min-w-max flex items-center">
        <Image
          src="/footer/payments.png"
          alt="Supported payment methods — VISA, Mastercard, bKash, Nagad, Rocket, and more. Verified by SSLCommerz."
          width={1240}
          height={39}
          // Below-the-fold (footer) → defer to lazy load.
          loading="lazy"
          // Cap at the asset's native width; scale down responsively on
          // narrower viewports without distorting the aspect ratio.
          className="h-auto max-w-full w-[1240px]"
        />
      </div>
    </div>
  );
}
