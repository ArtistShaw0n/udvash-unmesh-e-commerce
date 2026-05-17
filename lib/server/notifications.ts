/**
 * Notification provider abstraction.
 *
 * In dev: logs to stdout with a structured tag.
 * In prod: replace `dispatch()` with the real provider SDK call
 *   - Email: Resend, SendGrid, Postmark
 *   - SMS: Bulk SMS BD, Twilio
 *   - Push: Web Push API + service worker
 *
 * Trigger points already wired:
 *   - signup           → onWelcome
 *   - order placed     → onOrderConfirmed
 *   - status changes   → onOrderShipped / onOrderDelivered / onOrderCancelled
 *   - return workflow  → onReturnRequested / onReturnApproved / onReturnRefunded
 *   - password reset   → onPasswordReset
 *
 * Failures are logged but never thrown — notifications are best-effort.
 */

import "server-only";
import type { ServerOrder, ServerUser } from "./store";
import {
  renderWelcome,
  renderPasswordReset,
  renderOrderConfirmed,
  renderOrderShipped,
  renderOrderDelivered,
  renderOrderCancelled,
  renderReturnRequested,
  renderReturnRefunded,
} from "./email-templates";

export type Channel = "email" | "sms";

export interface NotificationEnvelope {
  to: string;
  channel: Channel;
  subject: string;
  /** Plain-text body — always present; used by SMS and as email text fallback. */
  body: string;
  /** Rich HTML body — only set for email channel when a template exists. */
  html?: string;
  templateName: string;
  /** Payload metadata for analytics / debugging */
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Provider dispatch. Three-mode behavior:
 *
 *   1. Email channel + RESEND_API_KEY set → send via Resend.
 *      (Real customer email. Live for prod once env var exists.)
 *   2. SMS channel + (future) BULK_SMS_BD_API_KEY → send via Bulk SMS BD.
 *      (Placeholder — Resend doesn't do SMS.)
 *   3. Otherwise → log to stdout / Vercel function logs.
 *      (Local dev, staging without keys.)
 *
 * Resend errors fall through to the log so notification failures never
 * block the calling flow (signup must still complete even if the welcome
 * email can't be sent).
 *
 * Required env:
 *   RESEND_API_KEY     `re_...`                            (Resend dashboard)
 *   RESEND_FROM_EMAIL  `noreply@your-domain.com`           (verified sender)
 *                       or `onboarding@resend.dev`         (Resend's default)
 */
async function dispatch(env: NotificationEnvelope): Promise<void> {
  // -------- 1. Email via Resend (when key + email channel) -----------
  if (env.channel === "email" && process.env.RESEND_API_KEY) {
    try {
      // Lazy import so the bundle stays small for code paths that don't
      // actually send email (e.g. SMS-only flows, or local dev without
      // the key set).
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: env.to,
        subject: env.subject,
        html: env.html ?? `<pre>${env.body}</pre>`,
        text: env.body,
      });
      if (result.error) {
        console.warn(
          `[notifications] Resend rejected ${env.templateName}:`,
          result.error,
        );
      } else {
        console.info(
          `📧 [resend] ${env.templateName} → ${env.to} (id=${result.data?.id ?? "?"})`,
        );
      }
      return;
    } catch (err) {
      // Network glitch, expired key, etc — fall through to logging so we
      // don't lose visibility into what would have been sent.
      console.warn(`[notifications] Resend threw (${env.templateName}):`, err);
    }
  }

  // -------- 2. SMS provider (placeholder) ----------------------------
  // When you wire Bulk SMS BD / Twilio / etc, add a similar block here:
  //   if (env.channel === "sms" && process.env.BULK_SMS_BD_API_KEY) { ... }

  // -------- 3. Fallback — log to stdout ------------------------------
  const tag = env.channel === "email" ? "📧" : "📱";
  const meta = env.html ? " [html+text]" : "";
  console.info(
    `${tag} [notification]${meta} ${env.templateName} → ${env.to}\n   ${env.subject}\n   ${env.body.slice(0, 120)}${env.body.length > 120 ? "..." : ""}`,
  );
}

async function safeSend(env: NotificationEnvelope): Promise<void> {
  try {
    await dispatch(env);
  } catch (err) {
    console.warn(`[notifications] failed (${env.templateName}):`, err);
  }
}

// ----------------------------------------------------------------
// Triggers — call these from your route handlers
// ----------------------------------------------------------------

export const notify = {
  async onWelcome(user: ServerUser, verifyCode: string) {
    const r = renderWelcome(user, verifyCode);
    await safeSend({
      to: user.email,
      channel: "email",
      subject: r.subject,
      html: r.html,
      body: r.text,
      templateName: "welcome",
      metadata: { userId: user.id, code: verifyCode },
    });
  },

  async onPasswordReset(user: ServerUser, resetCode: string) {
    const r = renderPasswordReset(user, resetCode);
    await safeSend({
      to: user.email,
      channel: "email",
      subject: r.subject,
      html: r.html,
      body: r.text,
      templateName: "password-reset",
      metadata: { userId: user.id },
    });
  },

  async onOrderConfirmed(user: ServerUser, order: ServerOrder) {
    const r = renderOrderConfirmed(user, order);
    await safeSend({
      to: user.email,
      channel: "email",
      subject: r.subject,
      html: r.html,
      body: r.text,
      templateName: "order-confirmed",
      metadata: { orderId: order.id, total: order.total },
    });
    if (user.phone) {
      await safeSend({
        to: user.phone,
        channel: "sms",
        subject: "Order confirmed",
        templateName: "order-confirmed-sms",
        body: `উদ্ভাস: অর্ডার #${order.id} নিশ্চিত। মোট ৳${order.total}। ধন্যবাদ।`,
      });
    }
  },

  async onOrderShipped(user: ServerUser, order: ServerOrder, trackingCode?: string) {
    const r = renderOrderShipped(user, order, trackingCode);
    await safeSend({
      to: user.email,
      channel: "email",
      subject: r.subject,
      html: r.html,
      body: r.text,
      templateName: "order-shipped",
      metadata: { orderId: order.id, trackingCode: trackingCode ?? "" },
    });
    if (user.phone) {
      await safeSend({
        to: user.phone,
        channel: "sms",
        subject: "Order shipped",
        templateName: "order-shipped-sms",
        body: `উদ্ভাস: অর্ডার #${order.id} কুরিয়ারে।${trackingCode ? ` ট্র্যাক: ${trackingCode}` : ""}`,
      });
    }
  },

  async onOrderDelivered(user: ServerUser, order: ServerOrder) {
    const r = renderOrderDelivered(user, order);
    await safeSend({
      to: user.email,
      channel: "email",
      subject: r.subject,
      html: r.html,
      body: r.text,
      templateName: "order-delivered",
      metadata: { orderId: order.id },
    });
  },

  async onOrderCancelled(user: ServerUser, order: ServerOrder, byAdmin = false) {
    const r = renderOrderCancelled(user, order, byAdmin);
    await safeSend({
      to: user.email,
      channel: "email",
      subject: r.subject,
      html: r.html,
      body: r.text,
      templateName: byAdmin ? "order-cancelled-by-admin" : "order-cancelled-by-customer",
      metadata: { orderId: order.id, byAdmin: String(byAdmin) },
    });
  },

  async onReturnRequested(user: ServerUser, order: ServerOrder) {
    const r = renderReturnRequested(user, order);
    await safeSend({
      to: user.email,
      channel: "email",
      subject: r.subject,
      html: r.html,
      body: r.text,
      templateName: "return-requested",
      metadata: { orderId: order.id },
    });
  },

  async onReturnRefunded(user: ServerUser, order: ServerOrder) {
    const r = renderReturnRefunded(user, order);
    await safeSend({
      to: user.email,
      channel: "email",
      subject: r.subject,
      html: r.html,
      body: r.text,
      templateName: "return-refunded",
      metadata: { orderId: order.id },
    });
  },
};
