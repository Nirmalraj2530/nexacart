const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Return Requested",
  "Returned",
  "Refund Initiated",
  "Refunded",
];

const PAYMENT_METHODS = [
  "Cash on Delivery",
  "UPI Payment",
  "Credit / Debit Card",
  "Net Banking",
];

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
    categoryName: { type: String, default: "General" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    trackingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(arr) => Array.isArray(arr) && arr.length > 0, "Order must contain at least one item"],
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    coupon: { type: String, default: null },
    shippingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    deliveryOption: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "Credit / Debit Card",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Pending",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, default: "" },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "United States" },
    },
    estimatedDelivery: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 86400000),
    },
    cancellationReason: { type: String, default: "" },
    returnReason: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.mongoId = ret._id ? ret._id.toString() : doc.id;
        ret.id = ret.orderNumber || ret.mongoId;
        ret.userId = ret.user?._id ? ret.user._id.toString() : ret.user?.toString?.() || ret.user;
        ret.items = (ret.items || []).map((item) => ({
          ...item,
          id: item.productId,
        }));
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Order = mongoose.model("Order", orderSchema);
Order.ORDER_STATUSES = ORDER_STATUSES;
Order.PAYMENT_METHODS = PAYMENT_METHODS;

module.exports = Order;

