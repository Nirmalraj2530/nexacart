"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, selectCartSubtotal, clearCart } from "@/redux/slices/cartSlice";
import { placeOrder } from "@/redux/slices/orderSlice";
import { addToast } from "@/redux/slices/uiSlice";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/formatters";
import { applyCoupon } from "@/data/mockCoupons";
import { PAYMENT_METHODS, ORDER_STATUSES } from "@/data/mockOrders";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import {
  ShoppingBag,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Truck,
  MapPin,
  CreditCard,
  Tag,
  ShieldCheck,
  Clock,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const hasRedirectedRef = useRef(false);
  const { isAuthenticated, isHydrated, openLogin } = useAuth();
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  // Form State (unconditionally initialized at top)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "United States",
  });

  const [deliveryOption, setDeliveryOption] = useState("standard"); // standard | express
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CARD);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  useEffect(() => {
    // Wait for localStorage auth to load before checking
    if (!isHydrated) return;

    if (!isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      dispatch(addToast({ message: "Please sign in to proceed with checkout", type: "warning" }));
      openLogin();
      router.replace("/cart");
    }
  }, [isHydrated, isAuthenticated, router, openLogin, dispatch]);

  const FREE_SHIPPING_THRESHOLD = 100;
  const baseShippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 10;
  const shippingFee = deliveryOption === "express" ? baseShippingFee + 15 : baseShippingFee;

  // Coupon calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const effectiveShipping = appliedCoupon?.shippingOverride ? 0 : shippingFee;
  const total = Math.max(0, subtotal - discountAmount + effectiveShipping);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    if (!couponCode.trim()) return;

    const res = applyCoupon(couponCode, subtotal);
    if (res.error) {
      setCouponError(res.error);
      dispatch(addToast({ message: res.error, type: "error" }));
    } else {
      setAppliedCoupon(res);
      dispatch(addToast({ message: `Coupon "${res.coupon?.code}" applied!`, type: "success" }));
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    dispatch(addToast({ message: "Coupon removed", type: "info" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State / Province is required";
    if (!formData.pincode.trim()) newErrors.pincode = "ZIP / Pincode is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const generatedOrderId = `NEXA-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: generatedOrderId,
      userId: null,
      status: ORDER_STATUSES.CONFIRMED,
      paymentMethod,
      paymentStatus: paymentMethod === PAYMENT_METHODS.COD ? "Pending" : "Paid",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image || (Array.isArray(item.images) ? item.images[0] : null),
        categoryName: item.category?.name || "General",
      })),
      subtotal,
      discount: discountAmount,
      coupon: appliedCoupon?.coupon?.code || null,
      shippingFee: effectiveShipping,
      tax: Number((subtotal * 0.05).toFixed(2)),
      total,
      shippingAddress: { ...formData },
      estimatedDelivery: new Date(Date.now() + (deliveryOption === "express" ? 2 : 4) * 86400000).toISOString(),
      trackingId: `TRK-US-${Math.floor(10000 + Math.random() * 90000)}`,
      isDemoOrder: true,
    };

    // Fast order processing simulation
    setTimeout(() => {
      setIsSubmitting(false);
      setPlacedOrderDetails(newOrder);
      dispatch(placeOrder(newOrder));
      dispatch(clearCart());
      setOrderSuccessModal(true);
    }, 900);
  };

  // SSR hydration safety guard
  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  if (cartItems.length === 0 && !orderSuccessModal) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="No Items To Checkout"
          description="Your cart is currently empty. Add items to your cart before proceeding to checkout."
          actionText="Explore Products"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
              ✓
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900">Cart</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-emerald-500" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <span className="text-xs sm:text-sm font-bold text-indigo-600">Shipping & Details</span>
          </div>
          <div className="h-0.5 flex-1 mx-3 bg-slate-200" />
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
              3
            </span>
            <span className="text-xs sm:text-sm font-medium">Confirmation</span>
          </div>
        </div>
      </div>

      {/* Back to Cart */}
      <div>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Cart
        </Link>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Shipping & Delivery & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Shipping Address</h2>
                <p className="text-xs text-slate-500">Where should we deliver your order?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Full Name *"
                  name="fullName"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                />
              </div>

              <Input
                label="Email Address *"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />

              <Input
                label="Phone Number *"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Street Address *"
                  name="address"
                  placeholder="123 Main St, Apt 4B"
                  value={formData.address}
                  onChange={handleChange}
                  error={errors.address}
                />
              </div>

              <Input
                label="City *"
                name="city"
                placeholder="San Francisco"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
              />

              <Input
                label="State / Province *"
                name="state"
                placeholder="California"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
              />

              <Input
                label="ZIP / Postal Code *"
                name="pincode"
                placeholder="94103"
                value={formData.pincode}
                onChange={handleChange}
                error={errors.pincode}
              />

              <Input
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Delivery Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Delivery Speed</h2>
                <p className="text-xs text-slate-500">Choose your preferred shipping method</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  deliveryOption === "standard"
                    ? "border-indigo-600 bg-indigo-50/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryOption"
                  value="standard"
                  checked={deliveryOption === "standard"}
                  onChange={() => setDeliveryOption("standard")}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="block font-bold text-slate-900 text-sm">Standard Ground</span>
                  <span className="block text-xs text-slate-500 mt-0.5">3-5 business days</span>
                  <span className="block text-xs font-semibold text-emerald-600 mt-1">
                    {baseShippingFee === 0 ? "FREE (Orders over $100)" : "$10.00 Flat"}
                  </span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  deliveryOption === "express"
                    ? "border-indigo-600 bg-indigo-50/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryOption"
                  value="express"
                  checked={deliveryOption === "express"}
                  onChange={() => setDeliveryOption("express")}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="block font-bold text-slate-900 text-sm">Express Priority</span>
                  <span className="block text-xs text-slate-500 mt-0.5">1-2 business days with air cargo</span>
                  <span className="block text-xs font-semibold text-indigo-600 mt-1">
                    +{formatCurrency(15)} expedited fee
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Demo Payment Method</h2>
                <p className="text-xs text-slate-500">Select simulated payment method (no charges applied)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { method: PAYMENT_METHODS.CARD, desc: "Simulated Visa / MasterCard" },
                { method: PAYMENT_METHODS.UPI, desc: "Instant UPI simulation" },
                { method: PAYMENT_METHODS.NET_BANKING, desc: "Simulated Net Banking" },
                { method: PAYMENT_METHODS.COD, desc: "Pay on receipt at doorstep" },
              ].map(({ method, desc }) => (
                <label
                  key={method}
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                    paymentMethod === method
                      ? "border-indigo-600 bg-indigo-50/40"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block font-bold text-slate-900 text-sm">{method}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Demo Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900 mt-2">
              <CreditCard className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Portfolio Demonstration Mode:</span> This checkout simulates order creation for review. No real payment transaction is made.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="space-y-6 lg:sticky lg:top-28">
          {/* Coupon Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" /> Have a Promo Code?
            </h3>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-900 block">{appliedCoupon.coupon?.code}</span>
                  <span className="text-emerald-700">{appliedCoupon.coupon?.description}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Try NEXA20 or SAVE10"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 uppercase font-mono tracking-wider focus:outline-none focus:border-indigo-600"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </Button>
                </div>
                {couponError && <p className="text-xs text-rose-600">{couponError}</p>}
                <p className="text-[11px] text-slate-400">Available codes: <strong>NEXA20</strong> (20% off), <strong>SAVE10</strong> (10% off)</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-slate-400 font-normal">{cartItems.length} items</span>
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-md bg-slate-100 font-bold flex items-center justify-center shrink-0 text-slate-600">
                      {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">{item.title}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({appliedCoupon?.coupon?.code})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-slate-900">
                  {effectiveShipping === 0 ? "FREE" : formatCurrency(effectiveShipping)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-2xl font-black text-indigo-600">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              icon={Lock}
              className="font-bold shadow-lg shadow-indigo-600/20"
            >
              Place Order ({formatCurrency(total)})
            </Button>

            <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-2.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safe 256-bit SSL encrypted checkout</span>
            </div>
          </div>
        </div>
      </form>

      {/* Order Success Confirmation Modal */}
      <Modal
        isOpen={orderSuccessModal}
        onClose={() => {
          setOrderSuccessModal(false);
          router.push("/account/orders");
        }}
      >
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Placed Successfully!</h2>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Order Reference</span>
              <span className="font-mono font-bold text-indigo-600">{placedOrderDetails?.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tracking Code</span>
              <span className="font-mono font-bold text-slate-800">{placedOrderDetails?.trackingId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Estimated Delivery</span>
              <span className="font-bold text-slate-800">
                {placedOrderDetails?.estimatedDelivery ? new Date(placedOrderDetails.estimatedDelivery).toLocaleDateString() : "4 Days"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-bold">Total Paid</span>
              <span className="font-black text-sm text-slate-900">{formatCurrency(placedOrderDetails?.total || 0)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Thank you, <span className="font-bold text-slate-900">{placedOrderDetails?.shippingAddress?.fullName}</span>. Your demo order has been saved to your account and is available for tracking.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setOrderSuccessModal(false);
                router.push(`/track-order?id=${placedOrderDetails?.id}`);
              }}
            >
              Track Order
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setOrderSuccessModal(false);
                router.push("/account/orders");
              }}
            >
              View Order History
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
