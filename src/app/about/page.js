import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Users,
  Award,
  Globe,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "About Us | Nexacart",
  description: "Learn about Nexacart's mission, quality standards, and modern curated e-commerce experience.",
};

export default function AboutPage() {
  return (
    <div className="space-y-16 py-8 sm:py-16">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Our Brand Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Curating Exceptional Products for the Modern Digital Shopper
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          NexaCart was founded to redefine digital retail. We combine intuitive design, verified supplier networks, and fast shipping to deliver a seamless shopping experience.
        </p>
      </section>

      {/* Values Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Curated Quality</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every item featured on Nexacart undergoes rigorous quality assessments to ensure durability, aesthetics, and lasting value.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Customer First</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              From our 30-day hassle-free return window to 24/7 support, our priority is guaranteeing total satisfaction with every purchase.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Fast Express Fulfillment</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Coupled with smart regional fulfillment hubs, we process orders within 24 hours to guarantee prompt doorstep delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-indigo-400">10,000+</span>
              <p className="text-xs sm:text-sm text-slate-400">Satisfied Customers</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-indigo-400">500+</span>
              <p className="text-xs sm:text-sm text-slate-400">Curated Products</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-indigo-400">99.8%</span>
              <p className="text-xs sm:text-sm text-slate-400">On-Time Delivery</p>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-indigo-400">24/7</span>
              <p className="text-xs sm:text-sm text-slate-400">Dedicated Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-3xl p-8 sm:p-12 space-y-4 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ready to explore our curated catalog?
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Find the latest electronics, fashion apparel, and lifestyle accessories at unbeatable value.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-colors"
            >
              Start Shopping Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
