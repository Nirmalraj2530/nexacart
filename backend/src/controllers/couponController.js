const Coupon = require("../models/Coupon");
const { evaluateCoupon } = require("./orderController");

/**
 * @desc    Validate a coupon code against an order subtotal
 * @route   POST /api/coupons/validate
 * @access  Public
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;
    const numericSubtotal = Math.max(0, Number(subtotal) || 0);
    const result = await evaluateCoupon(code, numericSubtotal);

    if (result.error || !result.coupon) {
      return res.status(400).json({
        success: false,
        message: result.error || "Invalid or expired coupon code.",
      });
    }

    return res.status(200).json({
      success: true,
      discount: result.discount,
      shippingOverride: result.shippingOverride,
      coupon: result.coupon.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all coupons (Admin / Manager)
 * @route   GET /api/coupons
 * @access  Private (Admin / Manager)
 */
const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json(coupons.map((c) => c.toJSON()));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new coupon (Admin / Manager)
 * @route   POST /api/coupons
 * @access  Private (Admin / Manager)
 */
const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      type,
      value,
      description,
      minOrderValue = 0,
      maxDiscount = 500,
      expiresAt,
      usageLimit = 1000,
      isActive = true,
    } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code, type, and value are required.",
      });
    }

    const coupon = await Coupon.create({
      code: String(code).trim().toUpperCase(),
      type,
      value: Number(value),
      description: description || "",
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: Number(maxDiscount) || 500,
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 86400000),
      usageLimit: Number(usageLimit) || 1000,
      isActive: Boolean(isActive),
    });

    return res.status(201).json(coupon.toJSON());
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a coupon (Admin / Manager)
 * @route   DELETE /api/coupons/:id
 * @access  Private (Admin / Manager)
 */
const deleteCoupon = async (req, res, next) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Coupon not found." });
    }
    return res.status(200).json({ success: true, message: "Coupon deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
};

