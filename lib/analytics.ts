/**
 * Analytics & error-tracking abstraction.
 *
 * Provides a single API surface for the app — `track("event", payload)` /
 * `trackError(err)` — that other modules call without knowing which provider
 * is behind it (GA4, Mixpanel, Sentry, etc).
 *
 * Today: events are routed to console only. To wire a real provider:
 *   1. Add the SDK to `_initProvider()` below
 *   2. Guard analytics-category events against `consent.analytics`
 *   3. Guard marketing-category events against `consent.marketing`
 *
 * NEVER call `track()` directly with PII (email, phone, address, payment data).
 * Pass user-id only after hashing.
 */

import type { ConsentState } from "./consent-context";

export type AnalyticsCategory = "necessary" | "analytics" | "marketing";

export interface AnalyticsEvent {
  name: string;
  category?: AnalyticsCategory;
  /** Arbitrary key/value payload — must not contain PII */
  props?: Record<string, string | number | boolean | null | undefined>;
}

// ----------------------------------------------------------------------
// Standard event names — the funnel we care about
// ----------------------------------------------------------------------
export const Events = {
  page_view: "page_view",

  // Catalog
  category_browse: "category_browse",
  search_submit: "search_submit",
  product_view: "product_view",

  // Cart
  cart_add: "cart_add",
  cart_remove: "cart_remove",
  cart_view: "cart_view",

  // Checkout
  checkout_begin: "checkout_begin",
  checkout_address_complete: "checkout_address_complete",
  checkout_payment_select: "checkout_payment_select",
  checkout_review: "checkout_review",
  purchase: "purchase",

  // Account
  signup_attempt: "signup_attempt",
  signup_success: "signup_success",
  login_attempt: "login_attempt",
  login_success: "login_success",
  email_verified: "email_verified",

  // Returns
  return_request: "return_request",
  order_cancel: "order_cancel",
} as const;

export type EventName = (typeof Events)[keyof typeof Events];

// ----------------------------------------------------------------------
// Provider stub — replace with real SDK init in production
// ----------------------------------------------------------------------
let consentSnapshot: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  decidedAt: null,
};

/** Called by ConsentProvider whenever the user's consent state changes. */
export function setAnalyticsConsent(state: ConsentState): void {
  consentSnapshot = state;
}

function isAllowed(category: AnalyticsCategory): boolean {
  if (category === "necessary") return true;
  if (category === "analytics") return consentSnapshot.analytics;
  if (category === "marketing") return consentSnapshot.marketing;
  return false;
}

/**
 * Fire an analytics event. Respects user consent.
 * No-op if the category is not consented.
 */
export function track(event: AnalyticsEvent): void {
  const category = event.category ?? "analytics";
  if (!isAllowed(category)) return;

  if (typeof window === "undefined") return;

  // TODO: wire real providers here
  // window.gtag?.("event", event.name, event.props);
  // window.fbq?.("trackCustom", event.name, event.props);
  // mixpanel.track(event.name, event.props);

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[analytics]", event.name, event.props ?? {});
  }
}

/**
 * Convenience: track a page view. Always "necessary" category so it fires
 * even without analytics consent — used for internal aggregate counting.
 * For real GA4 tracking, gate to analytics.
 */
export function trackPageView(path: string, title?: string): void {
  track({
    name: Events.page_view,
    category: "necessary",
    props: { path, title },
  });
}

/**
 * Log an error to the error-tracking provider (Sentry, Rollbar, etc).
 * Stays on even without analytics consent — necessary for product reliability.
 */
export function trackError(
  error: unknown,
  context?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (typeof window === "undefined") return;
  const err = error instanceof Error ? error : new Error(String(error));
  // TODO: Sentry.captureException(err, { extra: context })
  // eslint-disable-next-line no-console
  console.error("[trackError]", err.message, { stack: err.stack, ...context });
}
