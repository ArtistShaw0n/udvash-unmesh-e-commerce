import { NextRequest } from "next/server";
import { badRequest, ok, unauthorized } from "@/lib/server/response";
import { getCurrentUser } from "@/lib/server/auth";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** PATCH /api/profile — update name + phone */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid body");

  const name = (body.name as string | undefined)?.trim();
  const phone = (body.phone as string | undefined)?.trim();

  if (name !== undefined && !name) return badRequest("নাম খালি রাখা যাবে না");

  const updated = await store.updateUser(user.id, {
    ...(name !== undefined && { name }),
    ...(phone !== undefined && { phone: phone || undefined }),
  });

  return ok({
    user: {
      id: updated!.id,
      email: updated!.email,
      name: updated!.name,
      phone: updated!.phone,
      emailVerified: updated!.emailVerified,
    },
  });
}
