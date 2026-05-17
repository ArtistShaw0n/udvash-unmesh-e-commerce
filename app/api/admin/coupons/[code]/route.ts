import { NextRequest } from "next/server";
import {
  badRequest,
  forbidden,
  notFound,
  ok,
  unauthorized,
} from "@/lib/server/response";
import { requireAdmin } from "@/lib/server/auth";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ code: string }>;
}

/** PATCH /api/admin/coupons/[code] — update any field */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const { code } = await params;
  const existing = (await store.dumpCoupons()).find((c) => c.code === code.toUpperCase());
  if (!existing) return notFound();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid body");

  const next = {
    ...existing,
    ...body,
    code: existing.code, // immutable
  };
  return ok({ coupon: await store.upsertCoupon(next) });
}

/** DELETE /api/admin/coupons/[code] */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const { code } = await params;
  const ok2 = await store.deleteCoupon(code.toUpperCase());
  if (!ok2) return notFound();
  return ok({ deleted: true });
}
