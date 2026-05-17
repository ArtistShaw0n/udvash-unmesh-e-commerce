import { getCurrentUser, isAdminEmail } from "@/lib/server/auth";
import { ok, unauthorized } from "@/lib/server/response";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const addresses = store.addressesFor(user.id);
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
