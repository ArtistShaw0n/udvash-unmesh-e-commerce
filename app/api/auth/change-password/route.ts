import { NextRequest } from "next/server";
import { badRequest, ok, unauthorized } from "@/lib/server/response";
import {
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/server/auth";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const current = body?.current as string | undefined;
  const next = body?.next as string | undefined;

  if (!current || !next) return badRequest("বর্তমান + নতুন দুটোই দিন");
  if (next.length < 6) return badRequest("নতুন পাসওয়ার্ড অন্তত ৬ অক্ষর");

  const valid = await verifyPassword(current, user.passwordHash);
  if (!valid) return badRequest("বর্তমান পাসওয়ার্ড ভুল");

  const passwordHash = await hashPassword(next);
  await store.updateUser(user.id, { passwordHash });

  return ok({ changed: true });
}
