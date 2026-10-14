"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { selectOrders, hydrateOrders } from "@/redux/slices/orderSlice";
import { selectWishlistCount, hydrateWishlist } from "@/redux/slices/wishlistSlice";
import { selectCartTotalCount } from "@/redux/slices/cartSlice";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/common/Button";
import {
  Package,
  Heart,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Shield,
  CreditCard,
  User,
} from "lucide-react";

export default function AccountOverviewPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const orders = useSelector(selectOrders);
  const wishlistCount = useSelector(selectWishlistCount);
  const cartCount = useSelector(selectCartTotalCount);

  useEffect(() => {
    dispatch(hydrateOrders());
    dispatch(hydrateWishlist());
  }, [dispatch]);

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || "Customer"}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/80 max-w-lg leading-relaxed">
            Manage your orders, track active shipments, review your favorite products, and update your personal address book.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block mt-2">{orders.length}</span>
          <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1">
            View orders <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/account/wishlist"
          className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wishlist Items</span>
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block mt-2">{wishlistCount}</span>
          <span className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
            Saved favorites <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/cart"
          className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cart Items</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block mt-2">{cartCount}</span>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            Go to cart <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <p className="text-xs text-slate-500">Your latest purchases and tracking updates</p>
          </div>
          <Link href="/account/orders" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No orders placed yet</p>
            <p className="text-xs text-slate-500">Explore our catalog and find premium curated items!</p>
            <Link href="/products">
              <Button size="sm" variant="primary">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{order.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 1} items
                  </p>
                  <p className="text-xs font-bold text-slate-900">
                    Total: {formatCurrency(order.total)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/track-order?id=${order.id}`}>
                    <Button size="sm" variant="outline">
                      Track Package
                    </Button>
                  </Link>
                  <Link href="/account/orders">
                    <Button size="sm" variant="primary">
                      Order Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/account/addresses"
          className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-400 transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Manage Saved Addresses</h3>
            <p className="text-xs text-slate-500 mt-0.5">Add or update delivery addresses for faster checkout</p>
          </div>
        </Link>

        <Link
          href="/track-order"
          className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-400 transition-all flex items-start gap-4"
        >
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Track An Order</h3>
            <p className="text-xs text-slate-500 mt-0.5">Enter an order ID to view live tracking milestones</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

