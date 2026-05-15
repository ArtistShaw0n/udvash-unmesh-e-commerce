import { clsx } from "@/lib/clsx";

/**
 * Long row of supported payment-method chips. Renders as small monochrome
 * text-chips since we don't have brand-logo SVG assets yet — swap to real
 * brand logos when available.
 */
export interface PaymentMethodsRowProps {
  className?: string;
}

const METHODS = [
  "VISA",
  "MC",
  "AmEx",
  "JCB",
  "Diners",
  "DBBL",
  "bKash",
  "Nagad",
  "Rocket",
  "Upay",
  "TapnPay",
  "BBL",
  "SureCash",
  "MTB",
  "EBL",
  "IFIC",
  "City",
  "SCB",
  "HSBC",
  "Brac",
  "Eastern",
  "Prime",
  "Pubali",
  "Sonali",
  "Janata",
  "Agrani",
  "NRB",
  "Mercantile",
  "UCB",
  "Mutual",
];

export function PaymentMethodsRow({ className }: PaymentMethodsRowProps) {
  return (
    <div
      className={clsx(
        "rounded-md bg-white/95 px-3 py-2 overflow-x-auto",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="inline-flex items-center px-2 py-1 rounded-sm bg-neutral-100 text-neutral-700 text-[10px] font-bold whitespace-nowrap h-6">
          Pay With
        </span>
        {METHODS.map((m) => (
          <span
            key={m}
            className="inline-flex items-center justify-center px-2 py-1 rounded-sm bg-white text-neutral-700 text-[10px] font-bold whitespace-nowrap min-w-[42px] h-6 border border-neutral-200"
          >
            {m}
          </span>
        ))}
        <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-brand-50 text-brand-800 text-[10px] font-bold whitespace-nowrap h-6 border border-brand-200">
          Verified by <span className="font-black">SSLcommerz</span>
        </span>
      </div>
    </div>
  );
}
