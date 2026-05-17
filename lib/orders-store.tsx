"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "./api-client";
import { useAuth } from "./auth-context";
import type { OrderStatus } from "@/components/molecules/OrderCard";

// Re-export OrderStatus so other modules can import it from here
export type { OrderStatus };

export type ReturnStatus =
  | "none"
  | "requested"
  | "approved"
  | "picked-up"
  | "refunded"
  | "rejected";
export type PaymentMethod = "bkash" | "nagad" | "rocket" | "card" | "cod";
export type PaymentStatus = "paid" | "pending" | "cod";

export interface StoredOrderItem {
  slug: string;
  quantity: number;
  /** Snapshot of unit price at time of purchase. */
  price: number;
  /** Snapshot of the Bengali title for display even if catalog drops it later. */
  titleBn: string;
}

export interface StoredAddress {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  zip?: string;
}

export interface StoredOrder {
  id: string;
  email: string;
  placedAt: number;
  status: OrderStatus;
  items: StoredOrderItem[];
  address: StoredAddress;
  payment: { method: PaymentMethod; status: PaymentStatus };
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  couponCode?: string;
  returnStatus: ReturnStatus;
  returnReason?: string;
  cancelReason?: string;
}

export interface PlaceOrderInput {
  addressId: string;
  payment: { method: PaymentMethod };
  couponCode?: string;
}

export interface OrdersStoreValue {
  orders: StoredOrder[];
  hydrated: boolean;
  ordersFor: (email: string | undefined) => StoredOrder[];
  getOrder: (id: string) => StoredOrder | undefined;
  placeOrder: (
    input: PlaceOrderInput,
  ) => Promise<{ ok: true; id: string } | { ok: false; error: string }>;
  cancelOrder: (id: string, reason?: string) => Promise<{ ok: boolean; error?: string }>;
  requestReturn: (id: string, reason: string) => Promise<{ ok: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

const OrdersContext = createContext<OrdersStoreValue | null>(null);

interface ServerOrderResponse {
  id: string;
  userId: string;
  placedAt: number;
  status: OrderStatus;
  items: StoredOrderItem[];
  address: { label?: string } & StoredAddress;
  payment: { method: PaymentMethod; status: PaymentStatus };
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  couponCode?: string;
  returnStatus: ReturnStatus;
  returnReason?: string;
  cancelReason?: string;
}

function fromServer(o: ServerOrderResponse, email: string): StoredOrder {
  return {
    id: o.id,
    email,
    placedAt: o.placedAt,
    status: o.status,
    items: o.items,
    address: {
      recipientName: o.address.recipientName,
      phone: o.address.phone,
      line1: o.address.line1,
      line2: o.address.line2,
      city: o.address.city,
      zip: o.address.zip,
    },
    payment: o.payment,
    subtotal: o.subtotal,
    vat: o.vat,
    shipping: o.shipping,
    total: o.total,
    couponCode: o.couponCode,
    returnStatus: o.returnStatus,
    returnReason: o.returnReason,
    cancelReason: o.cancelReason,
  };
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user, hydrated: authHydrated, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    if (!isLoggedIn || !user) {
      setOrders([]);
      return;
    }
    const r = await api.listOrders();
    if (r.ok) {
      const list = (r.data.orders as ServerOrderResponse[]).map((o) =>
        fromServer(o, user.email),
      );
      setOrders(list);
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (!authHydrated) return;
    let cancelled = false;
    void refresh().finally(() => {
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authHydrated, refresh]);

  const placeOrder = useCallback<OrdersStoreValue["placeOrder"]>(
    async (input) => {
      const r = await api.placeOrder(input);
      if (!r.ok) return { ok: false, error: r.error };
      const order = r.data.order as ServerOrderResponse;
      if (user) {
        setOrders((prev) => [fromServer(order, user.email), ...prev]);
      }
      return { ok: true, id: order.id };
    },
    [user],
  );

  const cancelOrder = useCallback<OrdersStoreValue["cancelOrder"]>(
    async (id, reason) => {
      const r = await api.cancelOrder(id, reason);
      if (!r.ok) return { ok: false, error: r.error };
      await refresh();
      return { ok: true };
    },
    [refresh],
  );

  const requestReturn = useCallback<OrdersStoreValue["requestReturn"]>(
    async (id, reason) => {
      const r = await api.requestReturn(id, reason);
      if (!r.ok) return { ok: false, error: r.error };
      await refresh();
      return { ok: true };
    },
    [refresh],
  );

  const value = useMemo<OrdersStoreValue>(
    () => ({
      orders,
      hydrated,
      ordersFor: (email) => {
        if (!email) return [];
        const e = email.trim().toLowerCase();
        return orders
          .filter((o) => o.email === e)
          .sort((a, b) => b.placedAt - a.placedAt);
      },
      getOrder: (id) => orders.find((o) => o.id === id),
      placeOrder,
      cancelOrder,
      requestReturn,
      refresh,
    }),
    [orders, hydrated, placeOrder, cancelOrder, requestReturn, refresh],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersStoreValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders() must be used within <OrdersProvider>");
  return ctx;
}

// Date formatter (kept here to avoid breaking imports across the app)
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];
function toBn(value: number | string): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}
export function formatBnDate(epoch: number): string {
  const d = new Date(epoch);
  return `${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]}, ${toBn(d.getFullYear())}`;
}
