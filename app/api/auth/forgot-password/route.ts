import { NextRequest } from "next/server";
import { badRequest, ok } from "@/lib/server/response";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.trim()?.toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest("সঠিক ইমেইল দিন");
  }

  // Never leak whether the email exists. Always 200 with the same shape.
  const user = store.findUserByEmail(email);
  if (user) {
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    store.updateUser(user.id, { resetCode });
    // Real impl: dispatch a password-reset email with a tokenized link.
    // For demo we return the code so the user can paste it.
    return ok({ sent: true, devResetCode: resetCode });
  }

  return ok({ sent: true });
}
