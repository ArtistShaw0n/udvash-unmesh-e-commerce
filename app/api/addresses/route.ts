import { NextRequest } from "next/server";
import { badRequest, ok, unauthorized } from "@/lib/server/response";
import { getCurrentUser } from "@/lib/server/auth";
import { store, type ServerAddress } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** GET /api/addresses — list current user's addresses */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return ok({ addresses: store.addressesFor(user.id) });
}

/** POST /api/addresses — create a new address */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid body");

  const { label, recipientName, phone, line1, line2, city, zip, isDefault } = body;
  if (!recipientName || !phone || !line1 || !city) {
    return badRequest("সব ঘর পূরণ করুন");
  }

  const existing = store.addressesFor(user.id);
  const shouldBeDefault = isDefault === true || existing.length === 0;

  const id = `a_${Math.random().toString(36).slice(2, 10)}`;
  const address: ServerAddress = {
    id,
    userId: user.id,
    label: (label as string) || "ঠিকানা",
    recipientName,
    phone,
    line1,
    line2,
    city,
    zip,
    isDefault: shouldBeDefault,
  };
  store.upsertAddress(address);
  return ok({ address });
}
