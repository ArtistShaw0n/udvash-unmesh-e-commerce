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
 * Replace the body of this function in production to dispatch through
 * the real provider. The default implementation logs to stdout.
 */
async function dispatch(env: NotificationEnvelope): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    // TODO: swap with Resend / Bulk SMS BD call
    // Example:
    //   if (env.channel === "email") await resend.emails.send({
    //     to: env.to, subject: env.subject, html: env.html, text: env.body,
    //   });
    //   if (env.channel === "sms")   await bulkSmsBd.send({
    //     to: env.to, message: env.body,
    //   });
  }
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
