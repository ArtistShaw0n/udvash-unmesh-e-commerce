import { NextRequest } from "next/server";
import {
  badRequest,
  conflict,
  forbidden,
  ok,
  unauthorized,
} from "@/lib/server/response";
import { requireAdmin } from "@/lib/server/auth";
import { store } from "@/lib/server/store";
import type { Coupon, CouponKind } from "@/lib/coupons";

export const dynamic = "force-dynamic";

/** GET /api/admin/coupons */
export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  return ok({ coupons: await store.dumpCoupons() });
}

const KIND_VALUES: CouponKind[] = ["percent", "fixed", "free-shipping"];

function validateCoupon(body: unknown): Coupon | string {
  if (!body || typeof body !== "object") return "Invalid body";
  const o = body as Record<string, unknown>;
  const code = (o.code as string | undefined)?.trim().toUpperCase();
  if (!code || !/^[A-Z0-9_-]{2,30}$/.test(code)) return "Invalid code";
  const kind = o.kind as CouponKind;
  if (!KIND_VALUES.includes(kind)) return "Invalid kind";
  const value = Number(o.value ?? 0);
  if (!Number.isFinite(value) || value < 0) return "Invalid value";
  const description = (o.description as string | undefined)?.trim();
  const successLabel = (o.successLabel as string | undefined)?.trim();
  if (!description || !successLabel) return "Description + success label required";

  const coupon: Coupon = {
    code,
    kind,
    value,
    description,
    successLabel,
  };
  if (o.minSubtotal != null && Number.isFinite(Number(o.minSubtotal))) {
    coupon.minSubtotal = Number(o.minSubtotal);
  }
  if (o.maxDiscount != null && Number.isFinite(Number(o.maxDiscount))) {
    coupon.maxDiscount = Number(o.maxDiscount);
  }
  if (o.expiresAt != null && Number.isFinite(Number(o.expiresAt))) {
    coupon.expiresAt = Number(o.expiresAt);
  }
  return coupon;
}

/** POST /api/admin/coupons — create */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const body = await req.json().catch(() => null);
  const result = validateCoupon(body);
  if (typeof result === "string") return badRequest(result);

  const existing = (await store.dumpCoupons()).find((c) => c.code === result.code);
  if (existing) return conflict("এই কোড ইতিমধ্যে আছে");

  return ok({ coupon: await store.upsertCoupon(result) });
}
