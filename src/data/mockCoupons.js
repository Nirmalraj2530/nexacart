/**
 * DEMO DATA — Mock Coupon Rules
 * These coupons are for frontend demonstration only. No real discount is applied server-side.
 */

export const DEMO_COUPONS = [
  {
    code: "NEXA20",
    type: "percentage",
    value: 20,
    description: "Flat 20% off on all categories",
    minOrderValue: 0,
    maxDiscount: 500,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    isActive: true,
    usageLimit: 1000,
    usedCount: 342,
  },
  {
    code: "SAVE10",
    type: "percentage",
    value: 10,
    description: "10% off on orders above $50",
    minOrderValue: 50,
    maxDiscount: 100,
    expiresAt: new Date(Date.now() + 15 * 86400000).toISOString(),
    isActive: true,
    usageLimit: 500,
    usedCount: 128,
  },
  {
    code: "FREESHIP",
    type: "shipping",
    value: 100,
    description: "Free shipping on any order",
    minOrderValue: 0,
    maxDiscount: 20,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    isActive: true,
    usageLimit: 200,
    usedCount: 89,
  },
  {
    code: "FLAT15",
    type: "fixed",
    value: 15,
    description: "Flat $15 off on orders above $100",
    minOrderValue: 100,
    maxDiscount: 15,
    expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
    isActive: true,
    usageLimit: 300,
    usedCount: 0,
  },
  {
    code: "EXPIRED50",
    type: "percentage",
    value: 50,
    description: "50% off (expired)",
    minOrderValue: 0,
    maxDiscount: 200,
    expiresAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    isActive: false,
    usageLimit: 100,
    usedCount: 100,
  },
];

/**
 * Applies a coupon to a subtotal. Returns { discount, shippingOverride, error }.
 */
export function applyCoupon(code, subtotal) {
  const coupon = DEMO_COUPONS.find(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
  );

  if (!coupon) {
    return { discount: 0, shippingOverride: false, error: "Invalid or expired coupon code." };
  }

  if (new Date(coupon.expiresAt) < new Date()) {
    return { discount: 0, shippingOverride: false, error: "This coupon has expired." };
  }

  if (subtotal < coupon.minOrderValue) {
    return {
      discount: 0,
      shippingOverride: false,
      error: `Minimum order value of $${coupon.minOrderValue.toFixed(2)} required for this coupon.`,
    };
  }

  if (coupon.type === "percentage") {
    const raw = (subtotal * coupon.value) / 100;
    return { discount: Math.min(raw, coupon.maxDiscount), shippingOverride: false, error: null, coupon };
  }

  if (coupon.type === "fixed") {
    return { discount: Math.min(coupon.value, subtotal), shippingOverride: false, error: null, coupon };
  }

  if (coupon.type === "shipping") {
    return { discount: 0, shippingOverride: true, error: null, coupon };
  }

  return { discount: 0, shippingOverride: false, error: "Unknown coupon type.", coupon: null };
}
