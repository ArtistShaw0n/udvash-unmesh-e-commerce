import { getBookBySlug } from "@/lib/books";
import type { OrderStatus } from "@/components/molecules/OrderCard";

export interface OrderLineItem {
  slug: string;
  quantity: number;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  line1: string;
  city: string;
  zip: string;
}

export interface CourierInfo {
  name: string;
  trackingNumber: string;
  lastUpdate: string;     // human-readable Bengali
  lastLocation: string;
}

export interface Order {
  id: string;
  email: string;
  placedAt: string;       // display string in Bengali
  status: OrderStatus;
  items: OrderLineItem[];
  address: ShippingAddress;
  payment: { method: string; status: "paid" | "pending" | "cod" };
  courier?: CourierInfo;
  estimatedDelivery?: string;
}

/**
 * Demo orders for the public tracking page. Real app would query a backend.
 * Lookup is case-insensitive on both order id and email.
 */
const DEMO_ORDERS: Order[] = [
  {
    id: "UU892145",
    email: "shawon@example.com",
    placedAt: "১৪ মে, ২০২৬",
    status: "shipped",
    items: [
      { slug: "udvash-chemistry-parallel-text-hsc-2026", quantity: 1 },
      { slug: "udvash-physics-parallel-text-hsc-2026", quantity: 2 },
    ],
    address: {
      recipientName: "Shawon Ahmed",
      phone: "01798214677",
      line1: "হাউজ ৭১, রোড ৪, ব্লক সি",
      city: "বনশ্রী, ঢাকা",
      zip: "১২১৯",
    },
    payment: { method: "bKash", status: "paid" },
    courier: {
      name: "Sundarban Courier",
      trackingNumber: "SC-2026-89214",
      lastUpdate: "১৫ মে, ২০২৬ — দুপুর ২:১৫",
      lastLocation: "ঢাকা সর্টিং হাব",
    },
    estimatedDelivery: "১৭ মে, ২০২৬",
  },
  {
    id: "UU748120",
    email: "rahim@example.com",
    placedAt: "১১ মে, ২০২৬",
    status: "delivered",
    items: [{ slug: "udvash-math-parallel-text-hsc-2026", quantity: 1 }],
    address: {
      recipientName: "Rahim Uddin",
      phone: "01711000000",
      line1: "চট্টগ্রাম মেডিকেল রোড ১২",
      city: "চট্টগ্রাম",
      zip: "৪০০০",
    },
    payment: { method: "Cash on Delivery", status: "cod" },
    courier: {
      name: "RedX",
      trackingNumber: "RX-748120",
      lastUpdate: "১৩ মে, ২০২৬ — সকাল ১১:৩০",
      lastLocation: "ডেলিভার্ড — গ্রাহক",
    },
    estimatedDelivery: "১৩ মে, ২০২৬",
  },
  {
    id: "UU560331",
    email: "fatima@example.com",
    placedAt: "১৬ মে, ২০২৬",
    status: "confirmed",
    items: [
      { slug: "udvash-biology-parallel-text-hsc-2026", quantity: 1 },
      { slug: "udvash-chemistry-parallel-text-hsc-2026", quantity: 1 },
    ],
    address: {
      recipientName: "Fatima Akter",
      phone: "01612345678",
      line1: "ধানমন্ডি ২৭, রোড ১১",
      city: "ঢাকা",
      zip: "১২০৭",
    },
    payment: { method: "Nagad", status: "paid" },
    estimatedDelivery: "২০ মে, ২০২৬",
  },
];

export interface ResolvedOrderItem {
  slug: string;
  titleBn: string;
  title: string;
  categoryLabel: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ResolvedOrder extends Omit<Order, "items"> {
  items: ResolvedOrderItem[];
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
}

const VAT_RATE = 0.05;
const SHIPPING_FLAT = 50;

function resolve(order: Order): ResolvedOrder {
  const items: ResolvedOrderItem[] = order.items
    .map((line) => {
      const book = getBookBySlug(line.slug);
      if (!book) return null;
      return {
        slug: line.slug,
        titleBn: book.titleBn,
        title: book.title,
        categoryLabel: book.categoryLabel,
        price: book.price,
        quantity: line.quantity,
        subtotal: book.price * line.quantity,
      } satisfies ResolvedOrderItem;
    })
    .filter((x): x is ResolvedOrderItem => x !== null);

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const shipping = SHIPPING_FLAT;
  const total = subtotal + vat + shipping;

  return { ...order, items, subtotal, vat, shipping, total };
}

/**
 * Look up an order by id + email (both case-insensitive, trimmed).
 * Returns `null` for no match.
 */
export function findOrder(orderId: string, email: string): ResolvedOrder | null {
  const cleanId = orderId.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();
  const found = DEMO_ORDERS.find(
    (o) => o.id.toUpperCase() === cleanId && o.email.toLowerCase() === cleanEmail,
  );
  return found ? resolve(found) : null;
}

/** Hint shown on the form so visitors can try it. */
export const DEMO_TRACKING_HINT = {
  orderId: "UU892145",
  email: "shawon@example.com",
};
