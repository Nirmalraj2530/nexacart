"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { addToast } from "@/redux/slices/uiSlice";
import {
  ShoppingBag,
  Globe,
  Share2,
  MessageSquare,
  Heart,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Scale,
} from "lucide-react";
import { Button } from "@/components/common/Button";

export function Footer() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      dispatch(addToast({ message: "Please enter a valid email address", type: "error" }));
      return;
    }

    setSubscribed(true);
    dispatch(
      addToast({
        message: "Thank you for subscribing to Nexacart Insider!",
        type: "success",
      })
    );
  };

  return (
    <footer className="app-footer bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Join Nexacart Insider
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Get $20 Off Your Next Order
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Subscribe for flash deal announcements, exclusive member promo codes, and curated drop releases.
            </p>
          </div>

          {subscribed ? (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> You're on the VIP list! Use code NEXA20 at checkout.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="px-4 py-2.5 text-xs rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-72"
              />
              <Button type="submit" variant="primary" size="md" className="font-bold shrink-0">
                Subscribe
              </Button>
            </form>
          )}
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Nexa<span className="text-indigo-400">cart</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Modern digital commerce experience built on Next.js 16 and Redux Toolkit. Curated premium merchandise, instant client filtering, and simulated fulfillment workflows.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link href="/about" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="About Nexacart">
                <Globe className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Contact Us">
                <MessageSquare className="w-4 h-4" />
              </Link>
              <Link href="/compare" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title="Compare Products">
                <Scale className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Explore Catalog</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">All Products</Link>
              </li>
              <li>
                <Link href="/products?category=Clothes" className="hover:text-white transition-colors">Fashion & Apparel</Link>
              </li>
              <li>
                <Link href="/products?category=Electronics" className="hover:text-white transition-colors">Electronics & Gear</Link>
              </li>
              <li>
                <Link href="/products?category=Shoes" className="hover:text-white transition-colors">Footwear Collection</Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">Product Comparison</Link>
              </li>
            </ul>
          </div>

          {/* Customer Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Customer Account</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">Account Dashboard</Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">Order History</Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">Track Delivery</Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">Shopping Cart</Link>
              </li>
            </ul>
          </div>

          {/* Help & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Help & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping & Delivery Rates</Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-white transition-colors">30-Day Return Policy</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Notice</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Nexacart E-Commerce. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/locations" className="hover:text-slate-400">Store Locations</Link>
            <span>·</span>
            <Link href="/admin" className="hover:text-slate-400">Admin Portal</Link>
            <span>·</span>
            <span className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Next.js 16
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
