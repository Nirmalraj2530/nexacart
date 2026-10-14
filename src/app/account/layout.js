"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { useSelector } from "react-redux";
import { selectOrders } from "@/redux/slices/orderSlice";
import { selectWishlistCount } from "@/redux/slices/wishlistSlice";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const orders = useSelector(selectOrders);
  const wishlistCount = useSelector(selectWishlistCount);

  const navItems = [
    { label: "Account Overview", href: "/account", icon: LayoutDashboard },
    { label: "Order History", href: "/account/orders", icon: Package, badge: orders.length },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { label: "My Wishlist", href: "/account/wishlist", icon: Heart, badge: wishlistCount },
    { label: "Profile Settings", href: "/account/profile", icon: User },
  ];

  return (
    <AuthGuard requiredRole="Customer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-slate-900">My Account</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Account Navigation Sidebar */}
          <aside className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-6 shadow-xs lg:sticky lg:top-28">
            {/* User Profile Mini Badge */}
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg overflow-hidden border border-indigo-200 shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  (user?.name?.[0] || "U").toUpperCase()
                )}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                  {role} Account
                </span>
                <h3 className="font-black text-sm text-slate-900 truncate">
                  {user?.name || "Customer"}
                </h3>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Action */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Account Main Content Column */}
          <main className="lg:col-span-3 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

