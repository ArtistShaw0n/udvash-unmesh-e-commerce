import { NextRequest } from "next/server";
import { badRequest, ok, unauthorized } from "@/lib/server/response";
import { createSession, verifyPassword } from "@/lib/server/auth";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const { email, password } = body as { email?: string; password?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest("সঠিক ইমেইল দিন");
  }
  if (!password) return badRequest("পাসওয়ার্ড দিন");

  const user = await store.findUserByEmail(email);
  if (!user) return unauthorized("ইমেইল বা পাসওয়ার্ড ভুল");
  const passOk = await verifyPassword(password, user.passwordHash);
  if (!passOk) return unauthorized("ইমেইল বা পাসওয়ার্ড ভুল");

  await createSession(user);

  return ok({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      emailVerified: user.emailVerified,
    },
  });
}
