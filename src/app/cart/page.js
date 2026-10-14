"use client";

import React, { useState, useSyncExternalStore, useMemo } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartSubtotal,
  updateQuantity,
  removeFromCart,
  clearCart,
  addToCart,
} from "@/redux/slices/cartSlice";
import { addToast } from "@/redux/slices/uiSlice";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { formatCurrency, cleanImageUrl } from "@/utils/formatters";
import { applyCoupon } from "@/data/mockCoupons";
import { useGetProductsQuery } from "@/redux/services/productApi";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { ProductCard } from "@/components/product/ProductCard";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Tag,
  Bookmark,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

const SAVED_FOR_LATER_KEY = "nexacart_saved_for_later";

const savedSubscribers = new Set();
const subscribeSaved = (cb) => {
  savedSubscribers.add(cb);
  return () => savedSubscribers.delete(cb);
};
const notifySaved = () => savedSubscribers.forEach((cb) => cb());
const getSavedSnapshot = () => {
  if (typeof window === "undefined") return "[]";
  try {
    return localStorage.getItem(SAVED_FOR_LATER_KEY) || "[]";
  } catch {
    return "[]";
  }
};

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, openLogin } = useAuth();
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const rawSaved = useSyncExternalStore(subscribeSaved, getSavedSnapshot, () => "[]");
  const savedForLater = useMemo(() => {
    try {
      return JSON.parse(rawSaved);
    } catch {
      return [];
    }
  }, [rawSaved]);

  // Fetch recommended items
  const { data: allProducts = [] } = useGetProductsQuery();
  const recommendedProducts = allProducts.slice(0, 4);

  const saveToStorage = (items) => {
    try {
      localStorage.setItem(SAVED_FOR_LATER_KEY, JSON.stringify(items));
    } catch {}
    notifySaved();
  };

  const FREE_SHIPPING_THRESHOLD = 100;
  const baseShippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 10;
  const effectiveShipping = appliedCoupon?.shippingOverride ? 0 : baseShippingFee;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discountAmount + effectiveShipping);

  const handleUpdateQuantity = (id, newQty) => {
    dispatch(updateQuantity({ id, quantity: newQty }));
  };

  const handleRemove = (id, title) => {
    dispatch(removeFromCart(id));
    dispatch(addToast({ message: `Removed "${title}" from cart`, type: "info" }));
  };

  const handleSaveForLater = (item) => {
    dispatch(removeFromCart(item.id));
    const updated = [item, ...savedForLater.filter((s) => s.id !== item.id)];
    saveToStorage(updated);
    dispatch(addToast({ message: `Moved "${item.title}" to Saved for Later`, type: "info" }));
  };

  const handleMoveToCart = (item) => {
    dispatch(addToCart({ product: item, quantity: item.quantity || 1 }));
    const updated = savedForLater.filter((s) => s.id !== item.id);
    saveToStorage(updated);
    dispatch(addToast({ message: `Moved "${item.title}" back to cart`, type: "success" }));
  };

  const handleRemoveSaved = (id) => {
    const updated = savedForLater.filter((s) => s.id !== id);
    saveToStorage(updated);
    dispatch(addToast({ message: "Item removed from Saved for Later", type: "info" }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    setClearModalOpen(false);
    dispatch(addToast({ message: "Cleared all items from cart", type: "info" }));
  };

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

  if (cartItems.length === 0 && savedForLater.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Looks like you haven't added any items to your cart yet. Explore our latest products and start shopping!"
          actionText="Start Shopping"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-6 gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            You have <span className="font-bold text-slate-900">{cartItems.length}</span> items in your bag
          </p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={() => setClearModalOpen(true)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        )}
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free Shipping Progress Indicator */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                  <p className="text-xs font-bold text-indigo-900">
                    🎉 Congratulations! You unlocked <span className="underline">FREE Express Shipping</span>!
                  </p>
                ) : (
                  <p className="text-xs text-indigo-900">
                    Add <span className="font-bold">{formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}</span> more to qualify for <span className="font-bold">FREE Shipping</span>.
                  </p>
                )}
                <div className="w-full h-1.5 bg-indigo-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Item Thumbnail & Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Link href={`/products/${item.id}`} className="shrink-0">
                      <img
                        src={cleanImageUrl(item.image, null, item.categoryName || item.title)}
                        alt={item.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                      />
                    </Link>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {item.categoryName}
                      </span>
                      <Link href={`/products/${item.id}`}>
                        <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-xs font-semibold text-slate-500">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity Controls & Line Total & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-2 sm:pt-0">
                    {/* Quantity adjustment */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-l-xl transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-r-xl transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[5rem]">
                      <span className="text-sm font-black text-slate-900 block">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Action buttons: Save for Later & Remove */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSaveForLater(item)}
                        className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="Save for Later"
                        aria-label="Save for later"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(item.id, item.title)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary & Coupon Sidebar */}
          <div className="space-y-6">
            {/* Coupon Box */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" /> Apply Promo Code
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
                      placeholder="e.g. NEXA20"
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
                  <p className="text-[11px] text-slate-400">Available: <strong>NEXA20</strong> (20% off), <strong>SAVE10</strong> (10% off)</p>
                </div>
              )}
            </div>

            {/* Summary Box */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 space-y-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedCoupon?.coupon?.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {effectiveShipping === 0 ? "FREE" : formatCurrency(effectiveShipping)}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-black text-indigo-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="block pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  fullWidth
                  icon={ArrowRight}
                  className="font-bold shadow-lg shadow-indigo-600/20"
                  onClick={() => {
                    if (!isAuthenticated) {
                      dispatch(
                        addToast({
                          message: "Please sign in to proceed to checkout",
                          type: "warning",
                        })
                      );
                      openLogin();
                    } else {
                      router.push("/checkout");
                    }
                  }}
                >
                  Proceed To Checkout
                </Button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 text-xs text-slate-500">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Guaranteed 256-bit SSL Encrypted Safe Checkout</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Saved for Later Section */}
      {savedForLater.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Saved for Later ({savedForLater.length})
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {savedForLater.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Link href={`/products/${item.id}`} className="shrink-0">
                    <img
                      src={cleanImageUrl(item.image, null, item.title)}
                      alt={item.title}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                    />
                  </Link>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {item.categoryName || "General"}
                    </span>
                    <Link href={`/products/${item.id}`}>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-xs font-bold text-indigo-600">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleMoveToCart(item)}
                  >
                    Move to Cart
                  </Button>
                  <button
                    onClick={() => handleRemoveSaved(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Items Section */}
      {recommendedProducts.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Recommended For You
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Customers who bought items in your bag also liked these</p>
            </div>
            <Link href="/products" className="text-xs font-bold text-indigo-600 hover:underline">
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Clear Cart Confirmation Modal */}
      <Modal isOpen={clearModalOpen} onClose={() => setClearModalOpen(false)}>
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Clear Shopping Cart?</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Are you sure you want to remove all {cartItems.length} items from your shopping cart? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => setClearModalOpen(false)}>
              Keep Items
            </Button>
            <Button
              variant="primary"
              onClick={handleClearCart}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Yes, Clear Cart
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
