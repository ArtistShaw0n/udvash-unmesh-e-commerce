import { NextRequest } from "next/server";
import { badRequest, conflict, ok, unauthorized } from "@/lib/server/response";
import { getCurrentUser } from "@/lib/server/auth";
import { store, type ServerOrder } from "@/lib/server/store";
import { applyCoupon } from "@/lib/coupons";
import { getBookBySlug } from "@/lib/books";
import { notify } from "@/lib/server/notifications";
import { initiatePayment } from "@/lib/server/payments";

export const dynamic = "force-dynamic";

const VAT_RATE = 0.05;
const SHIPPING_FLAT = 50;

function newOrderId(): string {
  return "UU" + Date.now().toString().slice(-6);
}

/** GET /api/orders — list current user's orders */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return ok({ orders: store.ordersFor(user.id) });
}

/**
 * POST /api/orders — place an order. Body:
 * {
 *   addressId: string,
 *   payment: { method: "bkash"|"nagad"|"card"|"cod" },
 *   couponCode?: string
 * }
 *
 * Uses the user's selected cart items. Decrements inventory atomically.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!user.emailVerified) return badRequest("ইমেইল ভেরিফাই করুন আগে");

  const body = await req.json().catch(() => null);
  const addressId = body?.addressId as string | undefined;
  const paymentMethod = body?.payment?.method as string | undefined;
  const couponCode = body?.couponCode as string | undefined;

  if (!addressId) return badRequest("ঠিকানা সিলেক্ট করুন");
  if (!paymentMethod) return badRequest("পেমেন্ট মেথড সিলেক্ট করুন");

  const address = store.addressesFor(user.id).find((a) => a.id === addressId);
  if (!address) return badRequest("ঠিকানা পাওয়া যায়নি");

  const cartItems = store.cartFor(user.id).filter((c) => c.selected);
  if (cartItems.length === 0) return badRequest("কোন আইটেম সিলেক্ট নেই");

  // Resolve catalog + compute totals
  const resolved = cartItems
    .map((c) => {
      const book = getBookBySlug(c.slug);
      return book ? { c, book } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  if (resolved.length === 0) return badRequest("ক্যাটালগে আইটেম পাওয়া যায়নি");

  const subtotal = resolved.reduce((s, { c, book }) => s + book.price * c.quantity, 0);
  const baseShipping = SHIPPING_FLAT;

  let couponDiscount = 0;
  let shipping = baseShipping;
  let appliedCoupon: string | undefined;

  if (couponCode) {
    const result = applyCoupon(
      couponCode,
      { subtotal, shipping: baseShipping },
      store.dumpCoupons(),
    );
    if (!result.ok) return badRequest(result.error);
    couponDiscount = result.coupon.kind === "free-shipping" ? 0 : result.discount;
    shipping = result.shippingAfter;
    appliedCoupon = result.coupon.code;
  }

  const vat = Math.round(subtotal * VAT_RATE);
  const total = Math.max(0, subtotal - couponDiscount + vat + shipping);

  // Atomic stock decrement
  const inventoryResult = store.decrementInventory(
    resolved.map(({ c }) => ({ slug: c.slug, quantity: c.quantity })),
  );
  if (!inventoryResult.ok) {
    return conflict(`কিছু আইটেমের স্টক নেই: ${inventoryResult.lacking.join(", ")}`);
  }

  // Run the payment provider (stub today, real gateway swap later)
  const draftOrder: ServerOrder = {
    id: newOrderId(),
    userId: user.id,
    placedAt: Date.now(),
    status: "confirmed",
    items: resolved.map(({ c, book }) => ({
      slug: book.slug,
      quantity: c.quantity,
      price: book.price,
      titleBn: book.titleBn,
    })),
    address: {
      label: address.label,
      recipientName: address.recipientName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      zip: address.zip,
    },
    payment: { method: paymentMethod, status: "pending" },
    subtotal,
    vat,
    shipping,
    total,
    couponCode: appliedCoupon,
    returnStatus: "none",
  };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const paymentResult = await initiatePayment({
    order: draftOrder,
    successUrl: `${siteUrl}/order/${draftOrder.id}/success`,
    cancelUrl: `${siteUrl}/cart`,
    webhookUrl: `${siteUrl}/api/payments/webhook`,
  });

  const order: ServerOrder = {
    ...draftOrder,
    payment: { method: paymentMethod, status: paymentResult.status },
  };

  store.createOrder(order);
  store.clearCart(user.id, { onlySelected: true });

  // Fire-and-forget notification
  void notify.onOrderConfirmed(user, order);

  return ok({ order, redirectUrl: paymentResult.redirectUrl });
}
