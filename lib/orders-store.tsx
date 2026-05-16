"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { OrderStatus } from "@/components/molecules/OrderCard";

const STORAGE_KEY = "udvash:orders-v1";

export type ReturnStatus = "none" | "requested" | "approved" | "picked-up" | "refunded" | "rejected";
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
  email: string;            // owner — used to filter per-user
  placedAt: number;         // epoch ms
  status: OrderStatus;
  items: StoredOrderItem[];
  address: StoredAddress;
  payment: { method: PaymentMethod; status: PaymentStatus };
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  returnStatus: ReturnStatus;
  returnReason?: string;
  cancelReason?: string;
}

export interface PlaceOrderInput {
  email: string;
  items: StoredOrderItem[];
  address: StoredAddress;
  payment: { method: PaymentMethod; status: PaymentStatus };
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
}

export interface OrdersStoreValue {
  orders: StoredOrder[];
  hydrated: boolean;
  /** All orders that belong to a given email (sorted newest-first). */
  ordersFor: (email: string | undefined) => StoredOrder[];
  /** Look up one order by id. */
  getOrder: (id: string) => StoredOrder | undefined;
  /** Persist a new order and return its id. */
  placeOrder: (input: PlaceOrderInput) => string;
  cancelOrder: (id: string, reason?: string) => void;
  requestReturn: (id: string, reason: string) => void;
}

const OrdersContext = createContext<OrdersStoreValue | null>(null);

function readFromStorage(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function newOrderId(): string {
  return "UU" + Date.now().toString().slice(-6);
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const writeRef = useRef(false);

  useEffect(() => {
    setOrders(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!writeRef.current) {
      writeRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      /* ignore */
    }
  }, [orders, hydrated]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      setOrders(readFromStorage());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const placeOrder = useCallback((input: PlaceOrderInput): string => {
    const id = newOrderId();
    const next: StoredOrder = {
      id,
      email: input.email.trim().toLowerCase(),
      placedAt: Date.now(),
      status: "confirmed",
      items: input.items,
      address: input.address,
      payment: input.payment,
      subtotal: input.subtotal,
      vat: input.vat,
      shipping: input.shipping,
      total: input.total,
      returnStatus: "none",
    };
    setOrders((prev) => [next, ...prev]);
    return id;
  }, []);

  const cancelOrder = useCallback((id: string, reason?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id && (o.status === "placed" || o.status === "confirmed")
          ? { ...o, status: "cancelled", cancelReason: reason }
          : o,
      ),
    );
  }, []);

  const requestReturn = useCallback((id: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id && o.status === "delivered" && o.returnStatus === "none"
          ? { ...o, returnStatus: "requested", returnReason: reason }
          : o,
      ),
    );
  }, []);

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
    }),
    [orders, hydrated, placeOrder, cancelOrder, requestReturn],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersStoreValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders() must be used within <OrdersProvider>");
  return ctx;
}

/**
 * Format an epoch timestamp as a Bengali short date (e.g. "১৬ মে, ২০২৬").
 * Lives here so other code can stay free of date deps.
 */
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const BN_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
function toBn(value: number | string): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}
export function formatBnDate(epoch: number): string {
  const d = new Date(epoch);
  return `${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]}, ${toBn(d.getFullYear())}`;
}
