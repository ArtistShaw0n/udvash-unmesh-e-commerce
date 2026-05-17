import { describe, expect, it } from "vitest";
import { applyCoupon, findCoupon } from "@/lib/coupons";

describe("applyCoupon", () => {
  it("rejects unknown codes", () => {
    const r = applyCoupon("NOPE", { subtotal: 1000, shipping: 50 });
    expect(r.ok).toBe(false);
  });

  it("rejects subtotal below minimum", () => {
    const r = applyCoupon("NEW10", { subtotal: 200, shipping: 50 });
    expect(r.ok).toBe(false);
  });

  it("applies percent discount with maxDiscount cap", () => {
    // NEW10 = 10% off, max 200, min 500 subtotal
    const r = applyCoupon("NEW10", { subtotal: 5000, shipping: 50 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.discount).toBe(200); // capped at maxDiscount even though 10% = 500
      expect(r.shippingAfter).toBe(50);
    }
  });

  it("applies a fixed-amount coupon", () => {
    // STUDENT100 = ৳100 off, min 800
    const r = applyCoupon("STUDENT100", { subtotal: 1000, shipping: 50 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.discount).toBe(100);
  });

  it("zeroes shipping for free-shipping coupons", () => {
    // FREESHIP min 1000
    const r = applyCoupon("FREESHIP", { subtotal: 1500, shipping: 50 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.shippingAfter).toBe(0);
      expect(r.coupon.kind).toBe("free-shipping");
    }
  });

  it("is case-insensitive on the code", () => {
    expect(findCoupon("new10")?.code).toBe("NEW10");
  });
});
