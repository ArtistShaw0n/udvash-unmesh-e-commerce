import { getCurrentUser, isAdminEmail } from "@/lib/server/auth";
import { ok } from "@/lib/server/response";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/**
 * Session probe. Returns 200 + `{ user: null }` when there's no
 * session — NOT 401. Every page calls this on mount via auth-context;
 * a 401 fires the browser's network-error console log, which Lighthouse
 * (and devs in production) treats as a noise problem on logged-out
 * users. Returning 200 with a null user is the standard "is the user
 * here?" probe pattern (cf. Vercel's auth-template, NextAuth, etc.).
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return ok({ user: null, addresses: [] });
  }
  const addresses = await store.addressesFor(user.id);
  return ok({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      emailVerified: user.emailVerified,
      isAdmin: isAdminEmail(user.email),
    },
    addresses,
  });
}
