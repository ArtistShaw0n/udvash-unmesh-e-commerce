/**
 * HTML email templates.
 *
 * Each renderer accepts a typed payload and returns `{ subject, html, text }`.
 * The plain-text fallback is generated alongside the HTML so providers can
 * deliver multipart messages without an extra render pass.
 *
 * The `templates` registry at the bottom drives the admin preview page at
 * `/admin/notifications/preview` — adding a new template only requires
 * registering it there with sample data.
 *
 * No external dependencies: templates are returned as plain strings so the
 * file stays edge-safe and provider-agnostic. Swap to MJML / JSX-Email later
 * by changing only the render functions; consumers keep the same contract.
 */

import "server-only";
import type { ServerOrder, ServerUser } from "./store";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

// ----------------------------------------------------------------
// Brand shell — shared header / footer wrapper
// ----------------------------------------------------------------

const BRAND_TEAL = "#006D77";
const BRAND_TEAL_DARK = "#004D54";
const BRAND_CREAM = "#fffaf2";
const BRAND_INK = "#1a1a1a";
const BRAND_MUTED = "#666666";
const SITE_NAME = "উদ্ভাস-উন্মেষ";
const SITE_URL = "https://udvash-unmesh.com";

function escape(s: string | number | undefined): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bdt(n: number): string {
  return `৳${n.toLocaleString("bn-BD")}`;
}

interface ShellOptions {
  preheader?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

function shell(title: string, bodyHtml: string, opts: ShellOptions = {}): string {
  const cta = opts.ctaLabel && opts.ctaHref
    ? `<tr><td style="padding:24px 0 8px 0;text-align:center">
        <a href="${escape(opts.ctaHref)}"
           style="display:inline-block;padding:14px 32px;background:${BRAND_TEAL};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px">
          ${escape(opts.ctaLabel)}
        </a>
       </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="bn"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND_CREAM};font-family:'Hind Siliguri','Noto Sans Bengali',Arial,sans-serif;color:${BRAND_INK}">
${opts.preheader ? `<div style="display:none;font-size:1px;color:${BRAND_CREAM};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${escape(opts.preheader)}</div>` : ""}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${BRAND_CREAM};padding:32px 16px">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05)">
      <tr><td style="background:linear-gradient(135deg,${BRAND_TEAL} 0%,${BRAND_TEAL_DARK} 100%);padding:24px 32px;text-align:center">
        <div style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:1px">${SITE_NAME}</div>
        <div style="color:#ffffff;opacity:0.85;font-size:13px;margin-top:4px">বাংলা শিক্ষামূলক বইয়ের অনলাইন বুকশপ</div>
      </td></tr>
      <tr><td style="padding:32px 32px 8px 32px">
        ${bodyHtml}
        ${cta}
      </td></tr>
      <tr><td style="padding:24px 32px 32px 32px;border-top:1px solid #eeeeee;color:${BRAND_MUTED};font-size:12px;line-height:1.6;text-align:center">
        <div>© ${new Date().getFullYear()} ${SITE_NAME} · সকল অধিকার সংরক্ষিত</div>
        <div style="margin-top:6px">
          <a href="${SITE_URL}/contact" style="color:${BRAND_TEAL};text-decoration:none">যোগাযোগ</a> ·
          <a href="${SITE_URL}/privacy" style="color:${BRAND_TEAL};text-decoration:none">গোপনীয়তা</a> ·
          <a href="${SITE_URL}/help" style="color:${BRAND_TEAL};text-decoration:none">সহায়তা</a>
        </div>
        <div style="margin-top:10px;color:#999">
          এই ইমেইলটি একটি অটোমেটেড বার্তা — সরাসরি রিপ্লাই করার দরকার নেই।
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function paragraph(s: string): string {
  return `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:${BRAND_INK}">${s}</p>`;
}

function h1(s: string): string {
  return `<h1 style="margin:0 0 16px 0;font-size:22px;font-weight:800;color:${BRAND_INK}">${escape(s)}</h1>`;
}

function callout(s: string, tone: "info" | "success" | "warn" = "info"): string {
  const palette = {
    info: { bg: "rgba(0,109,119,0.10)", fg: BRAND_TEAL },
    success: { bg: "rgba(34,197,94,0.10)", fg: "#15803d" },
    warn: { bg: "rgba(234,88,12,0.10)", fg: "#c2410c" },
  }[tone];
  return `<div style="margin:18px 0;padding:14px 18px;background:${palette.bg};color:${palette.fg};border-radius:8px;font-size:14px;font-weight:600">${s}</div>`;
}

function orderItemsTable(order: ServerOrder): string {
  const rows = order.items
    .map(
      (it) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px">${escape(it.titleBn)} <span style="color:${BRAND_MUTED}">× ${it.quantity}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600">${bdt(it.price * it.quantity)}</td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:18px 0;border-top:2px solid #eee">
    ${rows}
    <tr><td style="padding:8px 0;font-size:13px;color:${BRAND_MUTED}">সাবটোটাল</td>
        <td style="padding:8px 0;font-size:13px;color:${BRAND_MUTED};text-align:right">${bdt(order.subtotal)}</td></tr>
    ${order.vat > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:${BRAND_MUTED}">ভ্যাট</td>
        <td style="padding:4px 0;font-size:13px;color:${BRAND_MUTED};text-align:right">${bdt(order.vat)}</td></tr>` : ""}
    <tr><td style="padding:4px 0;font-size:13px;color:${BRAND_MUTED}">ডেলিভারি</td>
        <td style="padding:4px 0;font-size:13px;color:${BRAND_MUTED};text-align:right">${order.shipping === 0 ? "ফ্রি" : bdt(order.shipping)}</td></tr>
    <tr><td style="padding:12px 0 0 0;font-size:16px;font-weight:800;border-top:2px solid #eee">মোট</td>
        <td style="padding:12px 0 0 0;font-size:18px;font-weight:800;text-align:right;color:${BRAND_TEAL};border-top:2px solid #eee">${bdt(order.total)}</td></tr>
  </table>`;
}

function addressBlock(order: ServerOrder): string {
  const a = order.address;
  return `<div style="margin:18px 0;padding:14px 18px;background:#f8f8f8;border-radius:8px;font-size:14px;line-height:1.7">
    <div style="font-weight:700;margin-bottom:4px">${escape(a.recipientName)}</div>
    <div style="color:${BRAND_MUTED}">${escape(a.line1)}${a.line2 ? `, ${escape(a.line2)}` : ""}</div>
    <div style="color:${BRAND_MUTED}">${escape(a.city)}${a.zip ? ` — ${escape(a.zip)}` : ""}</div>
    <div style="color:${BRAND_MUTED}">📞 ${escape(a.phone)}</div>
  </div>`;
}

// ----------------------------------------------------------------
// Template renderers
// ----------------------------------------------------------------

export function renderWelcome(user: ServerUser, verifyCode: string): RenderedEmail {
  const subject = `স্বাগতম ${user.name} — ${SITE_NAME}-এ`;
  const html = shell(
    subject,
    `${h1(`স্বাগতম, ${escape(user.name)}!`)}
     ${paragraph(`${SITE_NAME}-এ আপনাকে পেয়ে আমরা আনন্দিত। আপনার একাউন্ট সফলভাবে তৈরি হয়েছে।`)}
     ${paragraph("ইমেইল ভেরিফাই করতে নিচের কোডটি ব্যবহার করুন:")}
     ${callout(`<div style="font-size:14px;margin-bottom:6px">আপনার ভেরিফিকেশন কোড</div><div style="font-size:32px;font-weight:800;letter-spacing:4px">${escape(verifyCode)}</div>`, "info")}
     ${paragraph("এই কোডটি ৩০ মিনিটের জন্য বৈধ।")}`,
    {
      preheader: `স্বাগতম! ভেরিফাই কোড: ${verifyCode}`,
      ctaLabel: "ইমেইল ভেরিফাই করুন",
      ctaHref: `${SITE_URL}/verify-email?code=${encodeURIComponent(verifyCode)}`,
    },
  );
  const text = `স্বাগতম, ${user.name}!\n\nআপনার একাউন্ট সফলভাবে তৈরি হয়েছে।\nভেরিফিকেশন কোড: ${verifyCode}\n\nএই কোডটি ৩০ মিনিটের জন্য বৈধ।\n\n${SITE_URL}/verify-email`;
  return { subject, html, text };
}

export function renderPasswordReset(user: ServerUser, resetCode: string): RenderedEmail {
  const subject = "পাসওয়ার্ড রিসেট কোড";
  const html = shell(
    subject,
    `${h1("পাসওয়ার্ড রিসেট অনুরোধ")}
     ${paragraph(`প্রিয় ${escape(user.name)}, আমরা আপনার পাসওয়ার্ড রিসেট করার একটি অনুরোধ পেয়েছি।`)}
     ${callout(`<div style="font-size:14px;margin-bottom:6px">আপনার রিসেট কোড</div><div style="font-size:32px;font-weight:800;letter-spacing:4px">${escape(resetCode)}</div>`, "info")}
     ${paragraph("এই কোডটি ৩০ মিনিটের জন্য বৈধ। যদি আপনি এই অনুরোধ না করে থাকেন, এই ইমেইলটি উপেক্ষা করুন।")}`,
    {
      preheader: "আপনার পাসওয়ার্ড রিসেট করুন",
      ctaLabel: "পাসওয়ার্ড রিসেট করুন",
      ctaHref: `${SITE_URL}/reset-password?code=${encodeURIComponent(resetCode)}`,
    },
  );
  const text = `প্রিয় ${user.name},\n\nআপনার পাসওয়ার্ড রিসেট কোড: ${resetCode}\nএই কোডটি ৩০ মিনিটের জন্য বৈধ।\n\nযদি আপনি এই অনুরোধ না করে থাকেন, এই ইমেইলটি উপেক্ষা করুন।`;
  return { subject, html, text };
}

export function renderOrderConfirmed(user: ServerUser, order: ServerOrder): RenderedEmail {
  const subject = `অর্ডার নিশ্চিত — #${order.id}`;
  const paymentLabel =
    order.payment.status === "paid"
      ? "পেমেন্ট সম্পন্ন"
      : order.payment.status === "cod"
        ? "ক্যাশ অন ডেলিভারি"
        : "পেমেন্ট পেন্ডিং";
  const html = shell(
    subject,
    `${h1(`ধন্যবাদ, ${escape(user.name)}!`)}
     ${paragraph(`আপনার অর্ডার <strong>#${escape(order.id)}</strong> সফলভাবে গ্রহণ করা হয়েছে। আমরা ৩-৫ কর্মদিবসের মধ্যে ডেলিভারি করব।`)}
     ${callout(`✓ ${paymentLabel}`, "success")}
     ${h1("অর্ডার সামারি")}
     ${orderItemsTable(order)}
     ${h1("ডেলিভারি ঠিকানা")}
     ${addressBlock(order)}
     ${paragraph(`অর্ডার ট্র্যাক করতে যেকোনো সময় আপনার একাউন্টে লগইন করুন।`)}`,
    {
      preheader: `অর্ডার #${order.id} নিশ্চিত হয়েছে — মোট ${bdt(order.total)}`,
      ctaLabel: "অর্ডার ট্র্যাক করুন",
      ctaHref: `${SITE_URL}/account/orders/${encodeURIComponent(order.id)}`,
    },
  );
  const itemsText = order.items
    .map((it) => `  • ${it.titleBn} × ${it.quantity} = ${bdt(it.price * it.quantity)}`)
    .join("\n");
  const text = `ধন্যবাদ, ${user.name}!\n\nঅর্ডার #${order.id} নিশ্চিত হয়েছে।\n\n${itemsText}\n\nসাবটোটাল: ${bdt(order.subtotal)}\nডেলিভারি: ${order.shipping === 0 ? "ফ্রি" : bdt(order.shipping)}\nমোট: ${bdt(order.total)}\n\nট্র্যাক: ${SITE_URL}/account/orders/${order.id}`;
  return { subject, html, text };
}

export function renderOrderShipped(
  user: ServerUser,
  order: ServerOrder,
  trackingCode?: string,
): RenderedEmail {
  const subject = `অর্ডার পাঠানো হয়েছে — #${order.id}`;
  const html = shell(
    subject,
    `${h1("আপনার অর্ডার রওনা হয়েছে! 📦")}
     ${paragraph(`${escape(user.name)}, আপনার অর্ডার <strong>#${escape(order.id)}</strong> কুরিয়ার সার্ভিসে দেওয়া হয়েছে।`)}
     ${trackingCode ? callout(`<div style="font-size:13px;margin-bottom:4px">ট্র্যাকিং নম্বর</div><div style="font-size:20px;font-weight:800;letter-spacing:2px">${escape(trackingCode)}</div>`, "info") : ""}
     ${paragraph("ঢাকার ভেতরে ২-৩ দিন, ঢাকার বাইরে ৩-৫ কর্মদিবসের মধ্যে ডেলিভারি হবে।")}
     ${h1("ডেলিভারি ঠিকানা")}
     ${addressBlock(order)}`,
    {
      preheader: `অর্ডার #${order.id} কুরিয়ারে পাঠানো হয়েছে`,
      ctaLabel: "অর্ডার দেখুন",
      ctaHref: `${SITE_URL}/account/orders/${encodeURIComponent(order.id)}`,
    },
  );
  const text = `${user.name}, আপনার অর্ডার #${order.id} কুরিয়ারে দেওয়া হয়েছে।${trackingCode ? `\n\nট্র্যাকিং: ${trackingCode}` : ""}\n\nঢাকার ভেতরে ২-৩ দিন, ঢাকার বাইরে ৩-৫ কর্মদিবস।\n\n${SITE_URL}/account/orders/${order.id}`;
  return { subject, html, text };
}

export function renderOrderDelivered(user: ServerUser, order: ServerOrder): RenderedEmail {
  const subject = `অর্ডার ডেলিভার্ড — #${order.id}`;
  const html = shell(
    subject,
    `${h1("অর্ডার ডেলিভার্ড হয়েছে! 🎉")}
     ${paragraph(`${escape(user.name)}, আপনার অর্ডার <strong>#${escape(order.id)}</strong> সফলভাবে পৌঁছে গেছে।`)}
     ${paragraph("আমরা আশা করি আপনার বইগুলো পড়ার অভিজ্ঞতা চমৎকার হবে। অনুগ্রহ করে আপনার মতামত শেয়ার করুন — আপনার রিভিউ অন্য শিক্ষার্থীদের সিদ্ধান্ত নিতে সাহায্য করবে।")}
     ${callout("✓ ৭ দিনের রিটার্ন পলিসি — যেকোনো সমস্যায় যোগাযোগ করুন", "info")}`,
    {
      preheader: `অর্ডার #${order.id} ডেলিভার্ড — রিভিউ দিন`,
      ctaLabel: "রিভিউ দিন",
      ctaHref: `${SITE_URL}/account/orders/${encodeURIComponent(order.id)}`,
    },
  );
  const text = `${user.name}, আপনার অর্ডার #${order.id} ডেলিভার্ড হয়েছে।\n\nদয়া করে আপনার অভিজ্ঞতা শেয়ার করুন।\n\n${SITE_URL}/account/orders/${order.id}`;
  return { subject, html, text };
}

export function renderOrderCancelled(
  user: ServerUser,
  order: ServerOrder,
  byAdmin = false,
): RenderedEmail {
  const subject = `অর্ডার বাতিল — #${order.id}`;
  const refundLine =
    order.payment.status === "paid"
      ? callout("রিফান্ড ৩-৭ কর্মদিবসের মধ্যে আপনার পেমেন্ট মেথডে ফিরবে।", "warn")
      : "";
  const reasonLine = order.cancelReason
    ? paragraph(`<strong>কারণ:</strong> ${escape(order.cancelReason)}`)
    : "";
  const html = shell(
    subject,
    `${h1("অর্ডার বাতিল হয়েছে")}
     ${paragraph(`${escape(user.name)}, আপনার অর্ডার <strong>#${escape(order.id)}</strong> ${byAdmin ? "আমাদের পক্ষ থেকে বাতিল করা হয়েছে" : "বাতিল করা হয়েছে"}।`)}
     ${reasonLine}
     ${refundLine}
     ${paragraph("কোনো প্রশ্ন থাকলে আমাদের কাস্টমার সাপোর্টের সাথে যোগাযোগ করুন।")}`,
    {
      preheader: `অর্ডার #${order.id} বাতিল`,
      ctaLabel: "সাপোর্টে যোগাযোগ",
      ctaHref: `${SITE_URL}/contact`,
    },
  );
  const text = `${user.name}, আপনার অর্ডার #${order.id} বাতিল হয়েছে।${order.cancelReason ? `\nকারণ: ${order.cancelReason}` : ""}${order.payment.status === "paid" ? "\n\nরিফান্ড ৩-৭ কর্মদিবসের মধ্যে পাবেন।" : ""}\n\nসাপোর্ট: ${SITE_URL}/contact`;
  return { subject, html, text };
}

export function renderReturnRequested(user: ServerUser, order: ServerOrder): RenderedEmail {
  const subject = `রিটার্ন রিকোয়েস্ট পেয়েছি — #${order.id}`;
  const html = shell(
    subject,
    `${h1("রিটার্ন রিকোয়েস্ট গৃহীত")}
     ${paragraph(`${escape(user.name)}, আপনার অর্ডার <strong>#${escape(order.id)}</strong>-এর রিটার্ন রিকোয়েস্ট আমরা পেয়েছি।`)}
     ${order.returnReason ? paragraph(`<strong>কারণ:</strong> ${escape(order.returnReason)}`) : ""}
     ${callout("আমাদের প্রতিনিধি ২৪ ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করবেন।", "info")}
     ${paragraph("বইগুলো অরিজিনাল প্যাকেজিং সহ রেডি রাখুন। পিকআপের সময় কুরিয়ার এজেন্ট প্যাকেজটি সংগ্রহ করবেন।")}`,
    {
      preheader: `অর্ডার #${order.id}-এর রিটার্ন প্রক্রিয়াধীন`,
      ctaLabel: "রিটার্ন স্ট্যাটাস দেখুন",
      ctaHref: `${SITE_URL}/account/orders/${encodeURIComponent(order.id)}`,
    },
  );
  const text = `${user.name}, অর্ডার #${order.id}-এর রিটার্ন রিকোয়েস্ট গৃহীত হয়েছে।${order.returnReason ? `\nকারণ: ${order.returnReason}` : ""}\n\n২৪ ঘণ্টার মধ্যে যোগাযোগ করব।\n\n${SITE_URL}/account/orders/${order.id}`;
  return { subject, html, text };
}

export function renderReturnRefunded(user: ServerUser, order: ServerOrder): RenderedEmail {
  const subject = `রিফান্ড সম্পন্ন — #${order.id}`;
  const html = shell(
    subject,
    `${h1("রিফান্ড সম্পন্ন হয়েছে ✓")}
     ${paragraph(`${escape(user.name)}, আপনার অর্ডার <strong>#${escape(order.id)}</strong>-এর রিফান্ড সফলভাবে প্রসেস করা হয়েছে।`)}
     ${callout(`<div style="font-size:13px;margin-bottom:4px">রিফান্ড পরিমাণ</div><div style="font-size:28px;font-weight:800">${bdt(order.total)}</div>`, "success")}
     ${paragraph(`পেমেন্ট মেথড: <strong>${escape(order.payment.method)}</strong>। আপনার একাউন্টে ৩-৭ কর্মদিবসের মধ্যে পৌঁছে যাবে।`)}
     ${paragraph("আমাদের সেবা ব্যবহার করার জন্য ধন্যবাদ। ভবিষ্যতে আবার দেখা হবে।")}`,
    {
      preheader: `অর্ডার #${order.id}-এর রিফান্ড সম্পন্ন`,
      ctaLabel: "অর্ডার ইতিহাস",
      ctaHref: `${SITE_URL}/account/orders`,
    },
  );
  const text = `${user.name}, অর্ডার #${order.id}-এর ${bdt(order.total)} রিফান্ড সম্পন্ন হয়েছে।\n\n৩-৭ কর্মদিবসের মধ্যে ${order.payment.method}-এ পৌঁছে যাবে।`;
  return { subject, html, text };
}

// ----------------------------------------------------------------
// Registry — drives admin preview at /admin/notifications/preview
// ----------------------------------------------------------------

export interface TemplateEntry {
  key: string;
  label: string;
  description: string;
  render: () => RenderedEmail;
}

const SAMPLE_USER: ServerUser = {
  id: "sample-user-id",
  email: "rumana@example.com",
  passwordHash: "",
  name: "রুমানা আক্তার",
  phone: "01712345678",
  emailVerified: false,
  createdAt: Date.now(),
};

const SAMPLE_ORDER: ServerOrder = {
  id: "UDV-20260517-7421",
  userId: SAMPLE_USER.id,
  placedAt: Date.now(),
  status: "confirmed",
  items: [
    {
      slug: "udvash-physics-parallel-text-hsc-2026",
      titleBn: "উদ্ভাস পদার্থবিজ্ঞান প্যারালাল টেক্সট — HSC 2026",
      quantity: 1,
      price: 650,
    },
    {
      slug: "udvash-chemistry-parallel-text-hsc-2026",
      titleBn: "উদ্ভাস রসায়ন প্যারালাল টেক্সট — HSC 2026",
      quantity: 2,
      price: 580,
    },
  ],
  address: {
    label: "বাসা",
    recipientName: "রুমানা আক্তার",
    phone: "01712345678",
    line1: "ফ্ল্যাট ৪বি, বাড়ি ১২, রোড ৫",
    line2: "ধানমন্ডি",
    city: "ঢাকা",
    zip: "1205",
  },
  payment: { method: "bKash", status: "paid" },
  subtotal: 1810,
  vat: 0,
  shipping: 0,
  total: 1810,
  returnStatus: "none",
};

const SAMPLE_CANCELLED_ORDER: ServerOrder = {
  ...SAMPLE_ORDER,
  status: "cancelled",
  cancelReason: "ভুল ঠিকানা দিয়েছিলাম, পরে নতুন করে অর্ডার করব।",
};

const SAMPLE_RETURN_ORDER: ServerOrder = {
  ...SAMPLE_ORDER,
  status: "delivered",
  returnStatus: "requested",
  returnReason: "একটি বইয়ের পাতা ছেঁড়া।",
};

const SAMPLE_REFUNDED_ORDER: ServerOrder = {
  ...SAMPLE_ORDER,
  status: "delivered",
  returnStatus: "refunded",
};

export const templates: TemplateEntry[] = [
  {
    key: "welcome",
    label: "স্বাগতম + ইমেইল ভেরিফাই",
    description: "সাইনআপের পরে পাঠানো হয়। ৬-ডিজিট ভেরিফাই কোড থাকে।",
    render: () => renderWelcome(SAMPLE_USER, "482910"),
  },
  {
    key: "password-reset",
    label: "পাসওয়ার্ড রিসেট",
    description: "ভুলে যাওয়া পাসওয়ার্ড রিসেট কোড পাঠানো হয়।",
    render: () => renderPasswordReset(SAMPLE_USER, "739205"),
  },
  {
    key: "order-confirmed",
    label: "অর্ডার নিশ্চিতকরণ",
    description: "অর্ডার গ্রহণের সাথে সাথে সাবটোটাল-শিপিং-মোট সহ।",
    render: () => renderOrderConfirmed(SAMPLE_USER, SAMPLE_ORDER),
  },
  {
    key: "order-shipped",
    label: "অর্ডার শিপড",
    description: "কুরিয়ারে দেওয়ার পরে ট্র্যাকিং কোড সহ।",
    render: () => renderOrderShipped(SAMPLE_USER, SAMPLE_ORDER, "STEAD-984512"),
  },
  {
    key: "order-delivered",
    label: "অর্ডার ডেলিভার্ড",
    description: "ডেলিভারির পরে — রিভিউ দেওয়ার অনুরোধ।",
    render: () => renderOrderDelivered(SAMPLE_USER, { ...SAMPLE_ORDER, status: "delivered" }),
  },
  {
    key: "order-cancelled",
    label: "অর্ডার বাতিল",
    description: "গ্রাহক বা অ্যাডমিন বাতিল করলে — রিফান্ড লাইন সহ।",
    render: () => renderOrderCancelled(SAMPLE_USER, SAMPLE_CANCELLED_ORDER, false),
  },
  {
    key: "return-requested",
    label: "রিটার্ন রিকোয়েস্ট",
    description: "গ্রাহক রিটার্ন চাইলে — পিকআপের প্রস্তুতি গাইড।",
    render: () => renderReturnRequested(SAMPLE_USER, SAMPLE_RETURN_ORDER),
  },
  {
    key: "return-refunded",
    label: "রিফান্ড সম্পন্ন",
    description: "রিটার্ন প্রসেস শেষ হলে রিফান্ড পরিমাণ সহ।",
    render: () => renderReturnRefunded(SAMPLE_USER, SAMPLE_REFUNDED_ORDER),
  },
];

export function getTemplate(key: string): TemplateEntry | undefined {
  return templates.find((t) => t.key === key);
}
