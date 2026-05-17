import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/server/response";
import { applyCoupon } from "@/lib/coupons";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/**
 * POST /api/coupons/validate
 * Body: { code: string, subtotal: number, shipping: number }
 * Server reads the live catalog from the store so admin edits take effect.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const code = body?.code as string | undefined;
  const subtotal = Number(body?.subtotal);
  const shipping = Number(body?.shipping ?? 0);

  if (!code) return badRequest("Code required");
  if (!Number.isFinite(subtotal) || subtotal < 0) return badRequest("Invalid subtotal");

  const result = applyCoupon(code, { subtotal, shipping }, await store.dumpCoupons());
  if (!result.ok) return badRequest(result.error);

  return ok({
    coupon: result.coupon,
    discount: result.coupon.kind === "free-shipping" ? 0 : result.discount,
    shippingAfter: result.shippingAfter,
    label: result.label,
  });
}
