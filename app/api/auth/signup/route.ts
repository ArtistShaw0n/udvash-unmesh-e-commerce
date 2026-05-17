import { NextRequest } from "next/server";
import { badRequest, conflict, ok } from "@/lib/server/response";
import { createSession, hashPassword } from "@/lib/server/auth";
import { store } from "@/lib/server/store";
import { notify } from "@/lib/server/notifications";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const { name, email, phone, password } = body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  if (!name?.trim()) return badRequest("নাম দিন");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return badRequest("সঠিক ইমেইল দিন");
  }
  if (!password || password.length < 6) {
    return badRequest("পাসওয়ার্ড অন্তত ৬ অক্ষর");
  }

  const normalized = email.trim().toLowerCase();
  if (await store.findUserByEmail(normalized)) {
    return conflict("এই ইমেইলে ইতিমধ্যে একাউন্ট আছে");
  }

  const passwordHash = await hashPassword(password);
  const id = `u_${Math.random().toString(36).slice(2, 12)}`;
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await store.createUser({
    id,
    email: normalized,
    passwordHash,
    name: name.trim(),
    phone: phone?.trim(),
    emailVerified: false,
    emailVerifyCode: verifyCode,
    createdAt: Date.now(),
  });

  await createSession(user);

  // Fire the welcome email (in dev this just logs to stdout)
  void notify.onWelcome(user, verifyCode);

  // The verify code is leaked back to the client ONLY in development so the
  // dev / staging flow doesn't require a real email provider. In production
  // the code lives only in Postgres + the dispatch log (Vercel function
  // logs); the client must wait for the real email. Once Resend (or any
  // SMTP provider) is wired, drop this branch entirely.
  const isProd = process.env.NODE_ENV === "production";
  return ok({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      emailVerified: user.emailVerified,
    },
    ...(isProd ? {} : { devCode: verifyCode }),
  });
}
