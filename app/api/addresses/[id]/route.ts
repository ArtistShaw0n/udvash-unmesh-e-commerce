import { NextRequest } from "next/server";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/server/response";
import { getCurrentUser } from "@/lib/server/auth";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

/** PATCH — update fields OR set as default. Body: Partial<Address> | { setDefault: true } */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const list = store.addressesFor(user.id);
  const existing = list.find((a) => a.id === id);
  if (!existing) return notFound();
  if (existing.userId !== user.id) return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid body");

  const next = {
    ...existing,
    ...body,
    id: existing.id,
    userId: existing.userId,
  };
  // If setDefault toggle came in, also clear other defaults
  store.upsertAddress(next);
  return ok({ address: next });
}

/** DELETE — remove address */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const list = store.addressesFor(user.id);
  const existing = list.find((a) => a.id === id);
  if (!existing) return notFound();
  if (existing.userId !== user.id) return forbidden();
  store.deleteAddress(id);

  // Promote a new default if the removed one was default
  if (existing.isDefault) {
    const remaining = store.addressesFor(user.id);
    if (remaining.length > 0) {
      store.upsertAddress({ ...remaining[0], isDefault: true });
    }
  }
  return ok({ deleted: true });
}
