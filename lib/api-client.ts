/**
 * Typed fetch wrapper for the in-app API routes.
 *
 * Every endpoint returns `{ ok: true, data }` or `{ ok: false, error }` —
 * this module normalises that into a discriminated union the UI can
 * `switch` on without try/catch boilerplate.
 *
 * Frontend contexts (cart, auth, orders, etc.) can incrementally migrate
 * from localStorage to these calls. See BACKEND.md for the migration plan.
 */

export interface ApiOk<T> {
  ok: true;
  data: T;
}
export interface ApiErr {
  ok: false;
  error: string;
  code?: string;
  status?: number;
}
export type ApiResult<T> = ApiOk<T> | ApiErr;

interface FetchOpts {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  signal?: AbortSignal;
  /** Override the base URL (useful for testing). */
  baseUrl?: string;
}

async function call<T>(path: string, opts: FetchOpts = {}): Promise<ApiResult<T>> {
  const base = opts.baseUrl ?? "";
  try {
    const res = await fetch(`${base}${path}`, {
      method: opts.method ?? "GET",
      headers: opts.body ? { "Content-Type": "application/json" } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: "include",
      signal: opts.signal,
    });
    const json = await res.json().catch(() => null);
    if (!json) {
      return {
        ok: false,
        error: `Invalid response (${res.status})`,
        status: res.status,
      };
    }
    if (json.ok === true) return { ok: true, data: json.data as T };
    return {
      ok: false,
      error: json.error ?? `Request failed (${res.status})`,
      code: json.code,
      status: res.status,
    };
  } catch (err) {
    if ((err as DOMException)?.name === "AbortError") {
      return { ok: false, error: "Cancelled", code: "ABORTED" };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
      code: "NETWORK",
    };
  }
}

// ---- Typed API surface ----------------------------------------------

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  emailVerified: boolean;
  isAdmin?: boolean;
}

export const api = {
  // Auth ---------------------------------------------------------------
  signup: (input: { name: string; email: string; phone?: string; password: string }) =>
    call<{ user: SessionUser; devCode: string }>("/api/auth/signup", {
      method: "POST",
      body: input,
    }),
  login: (input: { email: string; password: string }) =>
    call<{ user: SessionUser }>("/api/auth/login", { method: "POST", body: input }),
  logout: () => call<{ logout: true }>("/api/auth/logout", { method: "POST" }),
  me: () => call<{ user: SessionUser; addresses: unknown[] }>("/api/auth/me"),
  verifyEmail: (code: string) =>
    call<{ user: SessionUser }>("/api/auth/verify-email", {
      method: "POST",
      body: { code },
    }),
  forgotPassword: (email: string) =>
    call<{ sent: true; devResetCode?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),
  resetPassword: (input: { email: string; code: string; password: string }) =>
    call<{ reset: true }>("/api/auth/reset-password", { method: "POST", body: input }),
  changePassword: (current: string, next: string) =>
    call<{ changed: true }>("/api/auth/change-password", {
      method: "POST",
      body: { current, next },
    }),

  // Catalog ------------------------------------------------------------
  listProducts: (q?: { category?: string; q?: string }) => {
    const params = new URLSearchParams();
    if (q?.category) params.set("category", q.category);
    if (q?.q) params.set("q", q.q);
    return call<{ products: unknown[]; total: number }>(
      `/api/products${params.toString() ? `?${params}` : ""}`,
    );
  },
  getProduct: (slug: string) =>
    call<{ book: unknown; related: unknown[] }>(`/api/products/${slug}`),

  // Cart ---------------------------------------------------------------
  getCart: () => call<{ items: unknown[] }>("/api/cart"),
  addToCart: (slug: string, quantity = 1) =>
    call<{ item: unknown }>("/api/cart", { method: "POST", body: { slug, quantity } }),
  updateCartItem: (slug: string, patch: { quantity?: number; selected?: boolean }) =>
    call<{ item?: unknown; removed?: true }>("/api/cart", {
      method: "PATCH",
      body: { slug, ...patch },
    }),
  removeCartItem: (slug: string) =>
    call<{ removed: true }>(`/api/cart?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
    }),
  clearCart: (which: "selected" | "all" = "all") =>
    call<{ cleared: string }>(`/api/cart?clear=${which}`, { method: "DELETE" }),

  // Orders -------------------------------------------------------------
  listOrders: () => call<{ orders: unknown[] }>("/api/orders"),
  placeOrder: (input: {
    addressId: string;
    payment: { method: string };
    couponCode?: string;
  }) => call<{ order: unknown }>("/api/orders", { method: "POST", body: input }),
  getOrder: (id: string) => call<{ order: unknown }>(`/api/orders/${id}`),
  cancelOrder: (id: string, reason?: string) =>
    call<{ order: unknown }>(`/api/orders/${id}`, {
      method: "PATCH",
      body: { action: "cancel", reason },
    }),
  requestReturn: (id: string, reason: string) =>
    call<{ order: unknown }>(`/api/orders/${id}`, {
      method: "PATCH",
      body: { action: "return", reason },
    }),

  // Coupons ------------------------------------------------------------
  validateCoupon: (input: { code: string; subtotal: number; shipping: number }) =>
    call<{ coupon: unknown; discount: number; shippingAfter: number; label: string }>(
      "/api/coupons/validate",
      { method: "POST", body: input },
    ),

  // Reviews ------------------------------------------------------------
  listReviews: (slug: string) =>
    call<{
      reviews: unknown[];
      summary: { count: number; average: number; distribution: Record<string, number> };
    }>(`/api/reviews/${slug}`),
  postReview: (slug: string, input: { rating: number; title?: string; body: string }) =>
    call<{ review: unknown }>(`/api/reviews/${slug}`, { method: "POST", body: input }),

  // Wishlist -----------------------------------------------------------
  getWishlist: () => call<{ slugs: string[] }>("/api/wishlist"),
  toggleWishlist: (slug: string) =>
    call<{ added: boolean }>("/api/wishlist", { method: "POST", body: { slug } }),

  // Addresses ----------------------------------------------------------
  listAddresses: () => call<{ addresses: unknown[] }>("/api/addresses"),
  createAddress: (input: {
    label: string;
    recipientName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    zip?: string;
    isDefault?: boolean;
  }) => call<{ address: unknown }>("/api/addresses", { method: "POST", body: input }),
  updateAddress: (id: string, patch: Record<string, unknown>) =>
    call<{ address: unknown }>(`/api/addresses/${id}`, { method: "PATCH", body: patch }),
  deleteAddress: (id: string) =>
    call<{ deleted: true }>(`/api/addresses/${id}`, { method: "DELETE" }),

  // Profile ------------------------------------------------------------
  updateProfile: (input: { name?: string; phone?: string }) =>
    call<{ user: SessionUser }>("/api/profile", { method: "PATCH", body: input }),

  // Admin --------------------------------------------------------------
  adminStats: () =>
    call<{ stats: Record<string, unknown> }>("/api/admin/stats"),
  adminOrders: (q?: { status?: string; q?: string }) => {
    const params = new URLSearchParams();
    if (q?.status) params.set("status", q.status);
    if (q?.q) params.set("q", q.q);
    return call<{ orders: unknown[]; total: number }>(
      `/api/admin/orders${params.toString() ? `?${params}` : ""}`,
    );
  },
  adminGetOrder: (id: string) =>
    call<{ order: unknown; customer: unknown }>(`/api/admin/orders/${id}`),
  adminUpdateOrder: (id: string, patch: { status?: string; returnStatus?: string }) =>
    call<{ order: unknown }>(`/api/admin/orders/${id}`, { method: "PATCH", body: patch }),
  adminInventory: () =>
    call<{ inventory: unknown[] }>("/api/admin/inventory"),
  adminSetInventory: (slug: string, units: number) =>
    call<{ slug: string; units: number }>("/api/admin/inventory", {
      method: "PATCH",
      body: { slug, units },
    }),
  adminCustomers: (q?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    return call<{ customers: unknown[]; total: number }>(
      `/api/admin/customers${params.toString() ? `?${params}` : ""}`,
    );
  },
  adminReturns: () => call<{ returns: unknown[] }>("/api/admin/returns"),
  adminReviews: () => call<{ reviews: unknown[] }>("/api/admin/reviews"),
};
