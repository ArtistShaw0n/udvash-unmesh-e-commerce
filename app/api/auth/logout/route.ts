import { clearSession } from "@/lib/server/auth";
import { ok } from "@/lib/server/response";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSession();
  return ok({ logout: true });
}
