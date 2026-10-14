"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { addToast } from "@/redux/slices/uiSlice";
import {
  Tag,
  Copy,
  Check,
  Clock,
  X,
  Sparkles,
  ShoppingBag,
  Gift,
  ArrowRight,
  Flame,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useMounted } from "@/hooks/useMounted";

const COUPON_CODE = "NEXA20";

export function PromoOfferModal() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const mounted = useMounted();

  // Countdown timer state: 12 hours remaining today
  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 48,
    seconds: 35,
  });

  useEffect(() => {
    // Check if dismissed in current session
    const isDismissed = sessionStorage.getItem("nexacart_promo_dismissed");

    // Only show on storefront, not on admin pages
    if (!pathname?.startsWith("/admin") && !isDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500); // Trigger after 2.5 seconds on page
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Live timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("nexacart_promo_dismissed", "true");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      dispatch(
        addToast({
          message: `Coupon code "${COUPON_CODE}" copied to clipboard!`,
          type: "success",
        })
      );
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      dispatch(
        addToast({
          message: `Use code: ${COUPON_CODE} at checkout!`,
          type: "info",
        })
      );
    }
  };

  const handleClaimOffer = () => {
    handleCopyCode();
    handleClose();
    router.push("/products");
  };

  // Do not show anything on admin routes
  if (!mounted || pathname?.startsWith("/admin")) {
    return null;
  }

  const formatNumber = (num) => String(num).padStart(2, "0");

  return (
    <>
      {/* Floating Offer Pill Trigger (Always available to reopen offer) */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-xs font-black shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
          aria-label="Open Special Offer"
        >
          <div className="p-1 rounded-full bg-white/20 text-white animate-pulse">
            <Gift className="w-3.5 h-3.5" />
          </div>
          <span className="tracking-wide">Get 20% OFF</span>
          <span className="hidden sm:inline px-1.5 py-0.5 rounded-full bg-white/25 text-[10px] font-mono font-bold">
            {COUPON_CODE}
          </span>
        </button>
      </div>

      {/* Offer Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Close offer modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Vibrant Header Banner with Gradient */}
            <div className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white p-6 sm:p-8 text-center overflow-hidden">
              {/* Background ambient decorative rings */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-pink-500/20 rounded-full blur-xl pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-indigo-100 text-[11px] font-extrabold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Limited Time Promotional Offer
              </div>

              <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                FLAT 20% OFF
              </h3>
              <p className="text-indigo-100 text-xs sm:text-sm mt-1.5 max-w-sm mx-auto font-medium">
                Welcome to Nexacart! Enjoy an exclusive discount across electronics, apparel & shoes.
              </p>

              {/* Countdown Timer Box */}
              <div className="mt-5 inline-flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/40 backdrop-blur-md border border-white/10 text-white">
                <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold uppercase tracking-wider pl-1">
                  <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Ends In:</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-black text-sm">
                  <span className="px-2 py-1 rounded-lg bg-white/15 min-w-[2rem] text-center">
                    {formatNumber(timeLeft.hours)}h
                  </span>
                  <span>:</span>
                  <span className="px-2 py-1 rounded-lg bg-white/15 min-w-[2rem] text-center">
                    {formatNumber(timeLeft.minutes)}m
                  </span>
                  <span>:</span>
                  <span className="px-2 py-1 rounded-lg bg-white/15 min-w-[2rem] text-center text-amber-300">
                    {formatNumber(timeLeft.seconds)}s
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body: Coupon Box & Perks */}
            <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
              {/* Coupon Code Container */}
              <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-indigo-300 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1.5 text-indigo-600 font-bold uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5" /> Coupon Code
                  </span>
                  <span>Applies to cart subtotal</span>
                </div>

                <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-wider pl-2">
                    {COUPON_CODE}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      copied
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 cursor-pointer"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Offer Perks */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Instant Checkout Discount</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Free Doorstep Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Valid on All Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Guaranteed Authenticity</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  fullWidth
                  icon={ArrowRight}
                  onClick={handleClaimOffer}
                  className="font-black text-sm sm:text-base shadow-xl shadow-indigo-600/25"
                >
                  Shop Now with 20% OFF
                </Button>

                <button
                  onClick={handleClose}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-medium py-2 transition-colors cursor-pointer"
                >
                  No thanks, I will browse catalog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
