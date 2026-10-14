"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Truck,
  RotateCcw,
  CreditCard,
  Package,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/common/Button";

const FAQ_DATA = [
  {
    category: "Shipping",
    question: "How do I qualify for FREE Express Shipping?",
    answer: "Any order with a merchandise subtotal of $100.00 or greater automatically qualifies for complimentary Standard Ground Shipping at checkout. For orders under $100, standard shipping is a flat $10.00 fee.",
  },
  {
    category: "Shipping",
    question: "How long does standard delivery take?",
    answer: "Orders are processed within 24 business hours. Standard Ground delivery typically takes 3 to 5 business days across continental regions. Expedited Air Express arrives within 1 to 2 business days.",
  },
  {
    category: "Shipping",
    question: "Can I track my shipment in real-time?",
    answer: "Yes! Once your order is placed, you will receive a unique tracking code (e.g. TRK-US-XXXXX). You can visit our Live Package Tracker page (/track-order) anytime to check transit milestones.",
  },
  {
    category: "Returns",
    question: "What is your return policy window?",
    answer: "We offer a 30-day satisfaction guarantee on all unworn, unaltered merchandise with original packaging intact. Simply visit your Account Order History (/account/orders) and select 'Return' next to any delivered order.",
  },
  {
    category: "Returns",
    question: "How soon are refunds credited to my account?",
    answer: "Once our regional fulfillment hub inspects your returned merchandise (usually 2-3 business days), refunds are processed to your original payment method within 5 to 7 business days.",
  },
  {
    category: "Coupons",
    question: "How do I apply demo discount codes?",
    answer: "In your Shopping Cart or during Checkout, enter codes like 'NEXA20' (20% off entire order) or 'SAVE10' (10% off orders above $50) in the promo box and click Apply.",
  },
  {
    category: "Orders",
    question: "Can I cancel an order after placing it?",
    answer: "Orders in 'Pending', 'Confirmed', or 'Processing' statuses can be cancelled directly through your Account Order History page with immediate cancellation confirmation.",
  },
  {
    category: "Payment",
    question: "What payment methods are supported in this demo?",
    answer: "In this portfolio demonstration application, we simulate Credit/Debit Cards (Visa/MasterCard), UPI instant payments, Net Banking, and Cash on Delivery. No real financial transaction is charged.",
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(0);

  const categories = ["All", "Shipping", "Returns", "Coupons", "Orders", "Payment"];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCat = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      !search.trim() ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Help & Support Center
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Quick answers to common questions regarding shipping schedules, return procedures, coupons, and orders.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions (e.g. shipping, refund, coupon)..."
          className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              activeCategory === cat
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center text-slate-500 text-sm">
            No matching questions found for "{search}".
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.question}</span>
                  <div className="p-1 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Need Help Box */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/60 rounded-3xl border border-indigo-200/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold text-base text-indigo-950">Still Have Questions?</h3>
          <p className="text-xs text-indigo-900/80">
            Our support representatives are standing by to assist with any inquiry.
          </p>
        </div>
        <Link href="/contact">
          <Button variant="primary" size="md" icon={ArrowRight} className="font-bold shrink-0">
            Contact Support Team
          </Button>
        </Link>
      </div>
    </div>
  );
}

