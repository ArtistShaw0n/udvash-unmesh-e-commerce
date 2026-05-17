/**
 * Coupon catalog — hardcoded for demo. In production this lives in DB,
 * managed by the admin panel, validated server-side.
 *
 * Each coupon has a `kind` (percent off / fixed off / free shipping) and
 * optional restrictions (min subtotal, max discount, expiry, single-use
 * per user, applicable categories).
 */

export type CouponKind = "percent" | "fixed" | "free-shipping";

export interface Coupon {
  code: string;             // uppercase canonical form
  kind: CouponKind;
  value: number;            // 10 = 10% off (percent), 100 = 100 BDT off (fixed), 0 = N/A (free-shipping)
  minSubtotal?: number;     // require subtotal ≥ this
  maxDiscount?: number;     // cap on the discount amount (for percent coupons)
  expiresAt?: number;       // epoch ms — undefined = never
  description: string;
  /** Pretty Bengali label shown after successful apply */
  successLabel: string;
}

/**
 * Default seed of coupons. The admin can override / extend at runtime;
 * the admin store reads from this seed on first boot.
 */
export const DEFAULT_COUPONS: Coupon[] = [
  {
    code: "NEW10",
    kind: "percent",
    value: 10,
    minSubtotal: 500,
    maxDiscount: 200,
    description: "১০% ছাড় (সর্বোচ্চ ২০০৳)। মিনিমাম অর্ডার ৫০০৳।",
    successLabel: "১০% ছাড় প্রযোজ্য হয়েছে",
  },
  {
    code: "STUDENT100",
    kind: "fixed",
    value: 100,
    minSubtotal: 800,
    description: "৮০০৳+ অর্ডারে সরাসরি ১০০৳ ছাড়।",
    successLabel: "১০০৳ ছাড় প্রযোজ্য হয়েছে",
  },
  {
    code: "FREESHIP",
    kind: "free-shipping",
    value: 0,
    minSubtotal: 1000,
    description: "১০০০৳+ অর্ডারে ফ্রি ডেলিভারি।",
    successLabel: "ফ্রি ডেলিভারি প্রযোজ্য হয়েছে",
  },
  {
    code: "HSC2026",
    kind: "percent",
    value: 15,
    minSubtotal: 1500,
    maxDiscount: 500,
    description: "HSC বইয়ের সেট অর্ডারে ১৫% ছাড় (সর্বোচ্চ ৫০০৳)।",
    successLabel: "১৫% ছাড় প্রযোজ্য হয়েছে",
  },
];

export interface CouponApplyInput {
  subtotal: number;
  shipping: number;
}

export interface CouponApplyResult {
  ok: true;
  coupon: Coupon;
  discount: number;       // amount subtracted from subtotal
  shippingAfter: number;  // shipping after coupon (free-shipping coupons set this to 0)
  label: string;
}

export interface CouponApplyError {
  ok: false;
  error: string;
}

export function findCoupon(
  code: string,
  catalog: Coupon[] = DEFAULT_COUPONS,
): Coupon | undefined {
  const cleaned = code.trim().toUpperCase();
  return catalog.find((c) => c.code === cleaned);
}

/**
 * Validate + compute a coupon application. Returns the discount amount + adjusted
 * shipping, or a typed error explaining why it couldn't apply.
 */
export function applyCoupon(
  code: string,
  input: CouponApplyInput,
  catalog: Coupon[] = DEFAULT_COUPONS,
): CouponApplyResult | CouponApplyError {
  const coupon = findCoupon(code, catalog);
  if (!coupon) return { ok: false, error: "অবৈধ কোড" };

  if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
    return { ok: false, error: "এই কুপনের মেয়াদ শেষ" };
  }
  if (coupon.minSubtotal && input.subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      error: `এই কুপনের জন্য মিনিমাম ${coupon.minSubtotal}৳ সাবটোটাল লাগবে`,
    };
  }

  let discount = 0;
  let shippingAfter = input.shipping;

  switch (coupon.kind) {
    case "percent": {
      discount = Math.floor((input.subtotal * coupon.value) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      break;
    }
    case "fixed": {
      discount = Math.min(coupon.value, input.subtotal);
      break;
    }
    case "free-shipping": {
      shippingAfter = 0;
      discount = input.shipping; // surfaced for UI
      break;
    }
  }

  return {
    ok: true,
    coupon,
    discount,
    shippingAfter,
    label: coupon.successLabel,
  };
}
