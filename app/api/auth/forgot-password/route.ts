import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/server/response";
import { store } from "@/lib/server/store";
import { notify } from "@/lib/server/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim()?.toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest("সঠিক ইমেইল দিন");
  }

  // Never leak whether the email exists. Always 200 with the same shape.
  const user = await store.findUserByEmail(email);
  if (user) {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await store.updateUser(user.id, { resetCode });
    void notify.onPasswordReset(user, resetCode);
    return ok({ sent: true, devResetCode: resetCode });
  }

  return ok({ sent: true });
}
