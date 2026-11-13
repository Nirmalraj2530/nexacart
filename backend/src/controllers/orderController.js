const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const Product = require("../models/Product");

/**
 * Helper to validate coupon rules server-side against subtotal.
 */
const evaluateCoupon = async (code, subtotal) => {
  if (!code || !String(code).trim()) {
    return { coupon: null, discount: 0, shippingOverride: false };
  }

  const coupon = await Coupon.findOne({
    code: String(code).trim().toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return { error: "Invalid or inactive coupon code." };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { error: "This coupon has expired." };
  }
  if (coupon.usedCount >= coupon.usageLimit) {
    return { error: "This coupon usage limit has been reached." };
  }
  if (subtotal < coupon.minOrderValue) {
    return {
      error: `Minimum order value of $${coupon.minOrderValue.toFixed(2)} required for this coupon.`,
    };
  }

  let discount = 0;
  let shippingOverride = false;

  if (coupon.type === "percentage") {
    discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || subtotal);
  } else if (coupon.type === "fixed") {
    discount = Math.min(coupon.value, subtotal);
  } else if (coupon.type === "shipping") {
    shippingOverride = true;
  }

  return { coupon, discount: Number(discount.toFixed(2)), shippingOverride };
};

/**
 * Find an order by either orderNumber (e.g. NEXA-100003) or Mongo _id.
 */
const findOrderByIdentifier = async (identifier) => {
  const clean = String(identifier || "").trim();
  const byNumber = await Order.findOne({ orderNumber: clean.toUpperCase() });
  if (byNumber) return byNumber;
  if (/^[a-f0-9]{24}$/i.test(clean)) {
    return await Order.findById(clean);
  }
  return null;
};

/**
 * @desc    Create a new order for logged-in user
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      items = [],
      shippingAddress,
      deliveryOption = "standard",
      paymentMethod = "Credit / Debit Card",
      couponCode,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cannot place an order with an empty cart." });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({ success: false, message: "Complete shipping address details are required." });
    }

    const normalizedItems = items.map((item) => ({
      productId: String(item.productId || item.id),
      title: String(item.title || "Product"),
      price: Math.max(0, Number(item.price) || 0),
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      image: item.image || "",
      categoryName: item.categoryName || "General",
    }));

    const subtotal = Number(
      normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    );

    const baseShipping = subtotal >= 100 || subtotal === 0 ? 0 : 10;
    let shippingFee = deliveryOption === "express" ? baseShipping + 15 : baseShipping;

    let discount = 0;
    let appliedCouponCode = null;
    if (couponCode) {
      const couponRes = await evaluateCoupon(couponCode, subtotal);
      if (couponRes.error) {
        return res.status(400).json({ success: false, message: couponRes.error });
      }
      discount = couponRes.discount;
      appliedCouponCode = couponRes.coupon.code;
      if (couponRes.shippingOverride) shippingFee = 0;
      await Coupon.updateOne({ _id: couponRes.coupon._id }, { $inc: { usedCount: 1 } });
    }

    const total = Number(Math.max(0, subtotal - discount + shippingFee).toFixed(2));
    const uniqueNum = Math.floor(100000 + (Date.now() % 900000));
    const orderNumber = `NEXA-${uniqueNum}`;
    const trackingId = `TRK-NC-${Math.floor(10000 + Math.random() * 90000)}`;
    const deliveryDays = deliveryOption === "express" ? 2 : 5;

    const order = await Order.create({
      orderNumber,
      trackingId,
      user: req.user._id,
      items: normalizedItems,
      subtotal,
      discount,
      coupon: appliedCouponCode,
      shippingFee,
      tax: 0,
      total,
      deliveryOption,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
      status: "Confirmed",
      shippingAddress,
      estimatedDelivery: new Date(Date.now() + deliveryDays * 86400000),
    });

    // Best-effort stock decrement for matching ObjectId products
    for (const item of normalizedItems) {
      if (/^[a-f0-9]{24}$/i.test(item.productId)) {
        await Product.updateOne(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        ).catch(() => {});
      }
    }

    return res.status(201).json({
      success: true,
      message: `Order ${orderNumber} placed successfully!`,
      order: order.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(orders.map((o) => o.toJSON()));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Track an order publicly by Order ID or Tracking ID
 * @route   GET /api/orders/track/:code
 * @access  Public
 */
const trackOrder = async (req, res, next) => {
  try {
    const code = String(req.params.code || "").trim().toUpperCase();
    if (!code) {
      return res.status(400).json({ success: false, message: "Order ID or tracking code is required." });
    }

    const order = await Order.findOne({
      $or: [{ orderNumber: code }, { trackingId: code }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No order found matching "${code}".`,
      });
    }

    return res.status(200).json(order.toJSON());
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin / Manager)
 * @route   GET /api/orders
 * @access  Private (Admin / Manager)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });
    return res.status(200).json(orders.map((o) => o.toJSON()));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an order (Customer owner or Admin)
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this order." });
    }

    if (["Delivered", "Cancelled", "Returned", "Refunded"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order in status "${order.status}" cannot be cancelled.`,
      });
    }

    order.status = "Cancelled";
    order.cancellationReason = req.body?.reason || "Customer requested cancellation";
    if (order.paymentStatus === "Paid") order.paymentStatus = "Refunded";
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order ${order.orderNumber} cancelled.`,
      order: order.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request return for delivered order
 * @route   PATCH /api/orders/:id/return
 * @access  Private
 */
const requestReturn = async (req, res, next) => {
  try {
    const order = await findOrderByIdentifier(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ success: false, message: "Not authorized to return this order." });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Returns can only be requested for delivered orders.",
      });
    }

    order.status = "Return Requested";
    order.returnReason = req.body?.reason || "Customer requested return";
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Return requested for ${order.orderNumber}.`,
      order: order.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order fulfillment status (Admin / Manager)
 * @route   PATCH /api/orders/:id/status
 * @access  Private (Admin / Manager)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await findOrderByIdentifier(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (status) {
      if (!Order.ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid order status." });
      }
      order.status = status;
    }

    if (paymentStatus && ["Pending", "Paid", "Failed", "Refunded"].includes(paymentStatus)) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    return res.status(200).json({
      success: true,
      message: `Order ${order.orderNumber} updated to "${order.status}".`,
      order: order.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  trackOrder,
  getAllOrders,
  cancelOrder,
  requestReturn,
  updateOrderStatus,
  evaluateCoupon,
};

