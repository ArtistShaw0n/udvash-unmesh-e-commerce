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

export type Channel = "email" | "sms";

export interface NotificationEnvelope {
  to: string;
  channel: Channel;
  subject: string;
  body: string;
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
    //   if (env.channel === "email") await resend.emails.send({...})
    //   if (env.channel === "sms")   await bulkSmsBd.send({...})
  }
  const tag = env.channel === "email" ? "📧" : "📱";
  console.info(
    `${tag} [notification] ${env.templateName} → ${env.to}\n   ${env.subject}\n   ${env.body.slice(0, 120)}${env.body.length > 120 ? "..." : ""}`,
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
    await safeSend({
      to: user.email,
      channel: "email",
      subject: `স্বাগতম ${user.name} — উদ্ভাস-উন্মেষে`,
      templateName: "welcome",
      body: `${user.name}, আপনার একাউন্ট সফলভাবে তৈরি হয়েছে। ভেরিফাই করতে এই কোডটি ব্যবহার করুন: ${verifyCode}`,
      metadata: { userId: user.id, code: verifyCode },
    });
  },

  async onPasswordReset(user: ServerUser, resetCode: string) {
    await safeSend({
      to: user.email,
      channel: "email",
      subject: "পাসওয়ার্ড রিসেট কোড",
      templateName: "password-reset",
      body: `${user.name}, আপনার পাসওয়ার্ড রিসেট কোড: ${resetCode}। এই কোড ৩০ মিনিট পর মেয়াদ শেষ হবে।`,
      metadata: { userId: user.id },
    });
  },

  async onOrderConfirmed(user: ServerUser, order: ServerOrder) {
    await safeSend({
      to: user.email,
      channel: "email",
      subject: `অর্ডার নিশ্চিত — #${order.id}`,
      templateName: "order-confirmed",
      body: `${user.name}, আপনার অর্ডার (#${order.id}, ৳${order.total}) সফলভাবে নেওয়া হয়েছে। আমরা ৩-৫ কর্মদিবসের মধ্যে ডেলিভারি করব।`,
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
    await safeSend({
      to: user.email,
      channel: "email",
      subject: `অর্ডার পাঠানো হয়েছে — #${order.id}`,
      templateName: "order-shipped",
      body: `${user.name}, আপনার অর্ডার (#${order.id}) কুরিয়ারে দেওয়া হয়েছে।${trackingCode ? ` ট্র্যাকিং নম্বর: ${trackingCode}` : ""}`,
      metadata: { orderId: order.id, trackingCode: trackingCode ?? "" },
    });
  },

  async onOrderDelivered(user: ServerUser, order: ServerOrder) {
    await safeSend({
      to: user.email,
      channel: "email",
      subject: `অর্ডার ডেলিভার্ড — #${order.id}`,
      templateName: "order-delivered",
      body: `${user.name}, আপনার অর্ডার (#${order.id}) ডেলিভার্ড হয়েছে। দয়া করে আপনার অভিজ্ঞতা শেয়ার করুন।`,
      metadata: { orderId: order.id },
    });
  },

  async onOrderCancelled(user: ServerUser, order: ServerOrder, byAdmin = false) {
    await safeSend({
      to: user.email,
      channel: "email",
      subject: `অর্ডার বাতিল — #${order.id}`,
      templateName: byAdmin ? "order-cancelled-by-admin" : "order-cancelled-by-customer",
      body: `${user.name}, আপনার অর্ডার (#${order.id}) বাতিল করা হয়েছে।${
        order.payment.status === "paid"
          ? " রিফান্ড ৩-৭ কর্মদিবসের মধ্যে পাবেন।"
          : ""
      }`,
      metadata: { orderId: order.id, byAdmin: String(byAdmin) },
    });
  },

  async onReturnRequested(user: ServerUser, order: ServerOrder) {
    await safeSend({
      to: user.email,
      channel: "email",
      subject: `রিটার্ন রিকোয়েস্ট পেয়েছি — #${order.id}`,
      templateName: "return-requested",
      body: `${user.name}, আপনার রিটার্ন রিকোয়েস্ট পেয়েছি। ২৪ ঘণ্টার মধ্যে আমাদের প্রতিনিধি যোগাযোগ করবেন।`,
      metadata: { orderId: order.id },
    });
  },

  async onReturnRefunded(user: ServerUser, order: ServerOrder) {
    await safeSend({
      to: user.email,
      channel: "email",
      subject: `রিফান্ড সম্পন্ন — #${order.id}`,
      templateName: "return-refunded",
      body: `${user.name}, আপনার রিটার্ন প্রসেস হয়েছে। ৳${order.total} রিফান্ড পাঠানো হয়েছে।`,
      metadata: { orderId: order.id },
    });
  },
};
