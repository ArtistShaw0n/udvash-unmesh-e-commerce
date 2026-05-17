import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/server/response";
import { hashPassword } from "@/lib/server/auth";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim()?.toLowerCase();
  const code = body?.code?.trim();
  const password = body?.password;

  if (!email || !code || !password) return badRequest("সব ঘর পূরণ করুন");
  if (password.length < 6) return badRequest("পাসওয়ার্ড অন্তত ৬ অক্ষর");

  const user = await store.findUserByEmail(email);
  if (!user || !user.resetCode || user.resetCode !== code) {
    return badRequest("ভুল কোড");
  }

  const passwordHash = await hashPassword(password);
  await store.updateUser(user.id, { passwordHash, resetCode: undefined });

  return ok({ reset: true });
}
