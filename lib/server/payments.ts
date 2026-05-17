/**
 * Payment provider abstraction.
 *
 * In dev: every payment is immediately marked "pending" for non-COD and
 * "paid" for card (simulating a successful capture).
 *
 * In prod: replace `initiatePayment()` + `verifyWebhook()` with the
 * real gateway SDK. Recommended BD options:
 *   - SSLCommerz (aggregator; covers bKash + Nagad + cards in one)
 *   - bKash Direct (https://developer.bka.sh/)
 *   - Nagad Direct
 *
 * Flow:
 *   1. /api/orders POST       → calls initiatePayment(order)
 *   2. Returns redirectUrl    → frontend redirects user to gateway
 *   3. Gateway POSTs result   → /api/payments/webhook (verifyWebhook + updateOrder)
 *   4. Customer returns       → /order/[id]/success (already exists)
 */

import "server-only";
import type { ServerOrder } from "./store";

export type PaymentMethod = "bkash" | "nagad" | "rocket" | "card" | "cod";
export type PaymentStatus = "paid" | "pending" | "cod";

export interface InitiateInput {
  order: ServerOrder;
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export interface InitiateResult {
  status: PaymentStatus;
  /** Where to redirect the customer (null for COD or instant-paid cards) */
  redirectUrl: string | null;
  /** Gateway-specific transaction id to store with the order */
  transactionId?: string;
}

/**
 * In production: call the real gateway SDK and return its hosted page URL.
 * In dev: simulate based on the method.
 */
export async function initiatePayment(
  input: InitiateInput,
): Promise<InitiateResult> {
  const method = input.order.payment.method as PaymentMethod;

  if (method === "cod") {
    return { status: "cod", redirectUrl: null };
  }

  if (method === "card") {
    // Pretend the card processor captured immediately
    return {
      status: "paid",
      redirectUrl: null,
      transactionId: `dev-${Date.now()}`,
    };
  }

  // Mobile wallets: in real life this returns a hosted-checkout URL.
  // In dev we keep the order in "pending" and pretend the user got an
  // instruction message on the gateway page.
  return {
    status: "pending",
    redirectUrl: null,
    transactionId: `dev-${Date.now()}`,
  };
}

export interface WebhookPayload {
  transactionId: string;
  orderId: string;
  status: "paid" | "failed";
  rawSignature: string;
}

/**
 * Verify a webhook came from the gateway. In dev we just accept any.
 * In prod, check HMAC against a shared secret stored in env.
 */
export function verifyWebhook(payload: WebhookPayload): boolean {
  if (process.env.NODE_ENV === "production") {
    // TODO: HMAC-verify against process.env.PAYMENT_WEBHOOK_SECRET
    return true;
  }
  return true;
}
