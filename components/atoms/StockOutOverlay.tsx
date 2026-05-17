import { clsx } from "@/lib/clsx";

export interface StockOutOverlayProps {
  className?: string;
  label?: string;
}

/**
 * Stock-out sticker overlay applied across a ProductCard image — Figma spec:
 *   • Rect21404 covers the entire image with rgba(0,0,0,0.2)
 *   • Text sticker centred: 143×40, padding 6 19, bg rgba(0,0,0,0.5),
 *     5px radius, rotate -12deg
 *   • Label: Poppins 700, 16px, line-height 28px, letter-spacing 1.55px, uppercase
 */
export function StockOutOverlay({
  className,
  label = "STOCK OUT",
}: StockOutOverlayProps) {
  return (
    <div
      aria-label="Stock out"
      className={clsx(
        "absolute inset-0 flex items-center justify-center bg-black/20",
        className,
      )}
    >
      <div
        className="-rotate-12 flex items-center justify-center rounded-xs bg-black/50 px-[19px] py-[6px] select-none"
        style={{ minWidth: "143px", height: "40px" }}
      >
        <span className="font-poppins font-bold text-white text-[16px] leading-[28px] tracking-[0.097em] uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}
