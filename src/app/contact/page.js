"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addToast } from "@/redux/slices/uiSlice";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function ContactPage() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    orderId: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Your name is required";
    if (!formData.email.trim()) {
      errs.email = "Your email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.message.trim()) {
      errs.message = "Message cannot be empty";
    } else if (formData.message.trim().length < 10) {
      errs.message = "Please provide at least 10 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      dispatch(
        addToast({
          message: "Thank you! Your message has been received.",
          type: "success",
        })
      );
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          We'd Love to Hear From You
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Have a question about an order, product sizing, or partnership? Our dedicated support team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Contact Info Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Support Channels
            </h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Customer Care Email</span>
                  <a href="mailto:support@nexacart.com" className="text-indigo-600 hover:underline">
                    support@nexacart.com
                  </a>
                  <span className="text-slate-400 block mt-0.5">Response within 2-4 hours</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Toll-Free Phone</span>
                  <a href="tel:+18005550199" className="text-slate-700 font-mono">
                    +1 (800) 555-0199
                  </a>
                  <span className="text-slate-400 block mt-0.5">Mon–Fri: 8am – 8pm EST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Operating Hours</span>
                  <span className="text-slate-600 block">Monday to Friday: 8am – 8pm EST</span>
                  <span className="text-slate-600 block">Saturday: 9am – 5pm EST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Fulfillment Hubs</span>
                  <Link href="/locations" className="text-indigo-600 hover:underline font-semibold">
                    View official store & pickup locations →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Card */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-3xl p-6 space-y-3">
            <h3 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" /> Have Quick Questions?
            </h3>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Check our Help Center for immediate answers on shipping rates, 30-day returns, and coupon codes.
            </p>
            <Link href="/faq" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
              Browse Frequently Asked Questions →
            </Link>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Message Dispatched!</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{formData.name}</strong>. Your inquiry has been sent to our customer experience queue. We will contact you at <strong className="text-slate-900">{formData.email}</strong>.
              </p>
              <div className="pt-4">
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Send Us a Message
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />

                <Input
                  label="Email Address *"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Subject / Topic
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Status & Delivery">Order Status & Delivery</option>
                    <option value="Returns & Refunds">Returns & Refunds</option>
                    <option value="Product Details & Sizing">Product Details & Sizing</option>
                    <option value="Business Partnership">Business Partnership</option>
                  </select>
                </div>

                <Input
                  label="Order Reference (Optional)"
                  name="orderId"
                  placeholder="e.g. NEXA-100001"
                  value={formData.orderId}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Message *
                </label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Please describe your question or issue in detail..."
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-xs rounded-2xl border ${
                    errors.message ? "border-rose-500 ring-2 ring-rose-500/10" : "border-slate-200"
                  } focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20`}
                />
                {errors.message && (
                  <p className="text-xs text-rose-600 mt-1">{errors.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Demo Submission Notice: No real external email is dispatched.
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  icon={Send}
                  className="font-bold shadow-sm"
                >
                  Send Inquiry
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

