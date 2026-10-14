import React from "react";
import { ShieldCheck, Lock, Eye, Database } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Nexacart",
  description: "Learn how Nexacart protects and respects your privacy and personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Data Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Privacy & Data Protection Notice
        </h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-8 text-slate-600 text-sm leading-relaxed">
        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-950 font-medium">
          <strong>Portfolio & Demonstration Notice:</strong> NexaCart is an e-commerce showcase application. Authentication uses public demo endpoints (EscuelaJS API). User sessions, carts, wishlists, and mock orders are stored locally within your browser using HTML5 LocalStorage. No real credit card or sensitive banking data is processed, transmitted, or stored on external servers.
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" /> 1. Information We Store Locally
          </h2>
          <p>
            To provide a fluid shopping experience without requiring continuous logins, the application stores the following non-sensitive data in your browser's local storage:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Shopping cart merchandise and selected quantities.</li>
            <li>Saved favorites (Wishlist) and product comparison lists.</li>
            <li>Recently viewed items browsing history.</li>
            <li>Demo JWT authentication tokens and public user profile attributes (name, email, role).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" /> 2. Security Practices
          </h2>
          <p>
            All network requests between this client application and external public APIs utilize HTTPS transport layer encryption. We adhere to modern web standards, including Content Security Policies (CSP), sanitization of URLs, and prevention of cross-site scripting vulnerabilities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" /> 3. Data Control & Deletion
          </h2>
          <p>
            You have complete sovereignty over stored browser data. You can clear your cart, clear your wishlist, or reset your session at any time by logging out or clearing your browser's site data and cookies for this domain.
          </p>
        </section>
      </div>
    </div>
  );
}

