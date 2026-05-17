import { NextRequest } from "next/server";
import {
  badRequest,
  forbidden,
  notFound,
  ok,
  unauthorized,
} from "@/lib/server/response";
import { requireAdmin } from "@/lib/server/auth";
import { store, type ServerOrder } from "@/lib/server/store";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

const TRANSITIONS: Record<ServerOrder["status"], ServerOrder["status"][]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

/** GET /api/admin/orders/[id] — single order detail (admin) */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const { id } = await params;
  const order = store.getOrder(id);
  if (!order) return notFound();
  const customer = store.findUserById(order.userId);
  return ok({
    order,
    customer: customer
      ? {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
        }
      : null,
  });
}

/** PATCH /api/admin/orders/[id] — body: { status?, returnStatus? } */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch (e) {
    return (e as Error).message === "UNAUTHORIZED" ? unauthorized() : forbidden();
  }
  const { id } = await params;
  const order = store.getOrder(id);
  if (!order) return notFound();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid body");

  const nextStatus = body.status as ServerOrder["status"] | undefined;
  const returnStatus = body.returnStatus as ServerOrder["returnStatus"] | undefined;

  const patch: Partial<ServerOrder> = {};

  if (nextStatus) {
    const allowed = TRANSITIONS[order.status];
    if (!allowed.includes(nextStatus)) {
      return badRequest(
        `Cannot transition ${order.status} → ${nextStatus}`,
      );
    }
    patch.status = nextStatus;
    // Cancelled by admin: restock items
    if (nextStatus === "cancelled") {
      store.incrementInventory(
        order.items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      );
    }
  }

  if (returnStatus) {
    if (order.returnStatus === "none") {
      return badRequest("No return request to update");
    }
    patch.returnStatus = returnStatus;
    // Refunded: restock items
    if (returnStatus === "refunded") {
      store.incrementInventory(
        order.items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
      );
    }
  }

  if (Object.keys(patch).length === 0) return badRequest("Nothing to update");

  const updated = store.updateOrder(id, patch);
  return ok({ order: updated });
}
