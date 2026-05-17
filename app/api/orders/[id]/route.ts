import { NextRequest } from "next/server";
import { badRequest, forbidden, notFound, ok, unauthorized } from "@/lib/server/response";
import { getCurrentUser } from "@/lib/server/auth";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const order = store.getOrder(id);
  if (!order) return notFound();
  if (order.userId !== user.id) return forbidden();
  return ok({ order });
}

/** PATCH — cancel or request return. Body: { action: "cancel" | "return", reason?: string } */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const { id } = await params;
  const order = store.getOrder(id);
  if (!order) return notFound();
  if (order.userId !== user.id) return forbidden();

  const body = await req.json().catch(() => null);
  const action = body?.action as "cancel" | "return" | undefined;
  const reason = body?.reason as string | undefined;

  if (action === "cancel") {
    if (order.status !== "placed" && order.status !== "confirmed") {
      return badRequest("এই অর্ডার বাতিল করা যাবে না");
    }
    store.incrementInventory(
      order.items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
    );
    const updated = store.updateOrder(id, { status: "cancelled", cancelReason: reason });
    return ok({ order: updated });
  }

  if (action === "return") {
    if (order.status !== "delivered" || order.returnStatus !== "none") {
      return badRequest("শুধু ডেলিভার্ড অর্ডার রিটার্ন করা যায়");
    }
    if (!reason?.trim()) return badRequest("রিটার্নের কারণ লিখুন");
    const updated = store.updateOrder(id, {
      returnStatus: "requested",
      returnReason: reason.trim(),
    });
    return ok({ order: updated });
  }

  return badRequest("Unknown action");
}
