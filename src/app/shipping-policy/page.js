import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, Clock, Globe, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Shipping Policy | Nexacart",
  description: "Learn about Nexacart's shipping rates, delivery timelines, and free shipping terms.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Store Terms
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-slate-600 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" /> 1. Shipping Rates & Thresholds
          </h2>
          <p>
            At Nexacart, we strive to keep shipping straightforward and transparent:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>FREE Standard Ground Shipping:</strong> Applied automatically on all orders with a merchandise subtotal of <strong>$100.00 or higher</strong> before taxes and after promotional discounts.
            </li>
            <li>
              <strong>Flat Rate Standard Shipping:</strong> A flat charge of <strong>$10.00</strong> applies to domestic orders below $100.00.
            </li>
            <li>
              <strong>Expedited Priority Express:</strong> Available for an additional <strong>$15.00</strong>, delivering packages in 1–2 business days via air freight.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" /> 2. Order Processing Times
          </h2>
          <p>
            All standard orders placed Monday through Friday before 2:00 PM EST are packaged and handed over to courier carriers within 24 hours. Orders placed over weekends or statutory holidays are dispatched the following business morning.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> 3. Real-Time Tracking
          </h2>
          <p>
            Upon package dispatch, customers receive an automated tracking code (e.g., <code className="font-mono text-indigo-600">TRK-US-XXXXX</code>). You can inspect transit progress, hub transfers, and estimated delivery dates using our{" "}
            <Link href="/track-order" className="font-bold text-indigo-600 hover:underline">
              Live Order Tracker
            </Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" /> 4. Undeliverable & Damaged Packages
          </h2>
          <p>
            In the rare event of damaged transit merchandise, please contact our support desk at{" "}
            <a href="mailto:support@nexacart.com" className="font-bold text-indigo-600 hover:underline">
              support@nexacart.com
            </a>{" "}
            within 48 hours of delivery for an immediate expedited replacement.
          </p>
        </section>
      </div>
    </div>
  );
}

