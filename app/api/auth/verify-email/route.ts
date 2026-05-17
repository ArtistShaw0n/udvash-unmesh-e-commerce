import { NextRequest } from "next/server";
import { badRequest, ok, unauthorized } from "@/lib/server/response";
import { getCurrentUser } from "@/lib/server/auth";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

const DEMO_OTP = "123456";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const code = body && typeof body.code === "string" ? body.code.trim() : "";

  if (!/^\d{6}$/.test(code)) return badRequest("৬ ডিজিটের কোড দিন");

  // Accept the issued code OR the demo code 123456 (for QA convenience)
  if (code !== user.emailVerifyCode && code !== DEMO_OTP) {
    return badRequest("ভুল কোড");
  }

  const updated = await store.updateUser(user.id, {
    emailVerified: true,
    emailVerifyCode: undefined,
  });

  return ok({
    user: {
      id: updated!.id,
      email: updated!.email,
      name: updated!.name,
      phone: updated!.phone,
      emailVerified: true,
    },
  });
}
