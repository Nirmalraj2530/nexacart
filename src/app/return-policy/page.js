import React from "react";
import Link from "next/link";
import { RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Return & Refund Policy | Nexacart",
  description: "Read Nexacart's 30-day return policy and refund guidelines.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Customer Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          30-Day Return & Refund Policy
        </h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-slate-600 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-indigo-600" /> 1. 30-Day Satisfaction Guarantee
          </h2>
          <p>
            We stand firmly behind the craftsmanship of every product. If you are not completely satisfied with your purchase, you may initiate a return within <strong>30 calendar days</strong> of package delivery.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" /> 2. Eligibility Requirements
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Merchandise must be unworn, undamaged, and unwashed.</li>
            <li>Original manufacturer tags, hygiene seals, and packaging must remain attached.</li>
            <li>Electronics must include all accessories, power cords, and manuals in the original product box.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> 3. How to Initiate a Return
          </h2>
          <p>
            Returns can be initiated directly online without needing to call support:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Sign in and visit your <Link href="/account/orders" className="text-indigo-600 font-bold hover:underline">Order History</Link>.</li>
            <li>Select the delivered order and click the <strong>"Return"</strong> button.</li>
            <li>Select the reason for return and submit. A return authorization summary is generated instantly.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-indigo-600" /> 4. Refund Processing Time
          </h2>
          <p>
            Once our fulfillment hub inspects the returned package (normally 2–3 business days after arrival), the full purchase amount will be credited back to your original payment method. Depending on your financial institution, funds appear on your card statement within <strong>5 to 7 business days</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}

