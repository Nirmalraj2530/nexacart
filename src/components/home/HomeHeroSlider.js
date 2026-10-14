"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/common/Button";

const SLIDES = [
  {
    id: 1,
    tag: "⚡ FLASH SALE — UP TO 40% OFF",
    titlePrimary: "Next-Gen Audio &",
    titleHighlight: "Smart Tech Gear",
    description:
      "Immerse yourself in studio-grade acoustics, active noise cancellation, and high-performance smart wearables crafted for everyday excellence.",
    primaryCtaText: "Shop Audio Deals",
    primaryCtaHref: "/products?category=2",
    secondaryCtaText: "Explore Tech",
    secondaryCtaHref: "/products",
    badgeTitle: "Deal of the Day",
    badgeSubtitle: "Starting from $49.99",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
    gradientOverlay: "from-slate-950 via-indigo-950/90 to-slate-900/60",
    accentColor: "from-indigo-400 via-purple-300 to-pink-400",
  },
  {
    id: 2,
    tag: "🔥 NEW DROP — FLAT 30% OFF",
    titlePrimary: "Urban Streetwear &",
    titleHighlight: "Winter Essentials",
    description:
      "Upgrade your wardrobe with tailored heavy-knit hoodies, minimalist outerwear, and breathable premium fabrics engineered for modern city life.",
    primaryCtaText: "Explore Apparel",
    primaryCtaHref: "/products?category=1",
    secondaryCtaText: "View Lookbook",
    secondaryCtaHref: "/products",
    badgeTitle: "Trending Drop",
    badgeSubtitle: "Over 1,200+ Ordered This Week",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80",
    gradientOverlay: "from-slate-950 via-purple-950/90 to-slate-900/60",
    accentColor: "from-rose-400 via-fuchsia-300 to-amber-300",
  },
  {
    id: 3,
    tag: "👟 SNEAKER FEST — LIMITED RELEASE",
    titlePrimary: "Exclusive Kicks &",
    titleHighlight: "Athletic Performance",
    description:
      "Engineered for responsiveness, peak comfort, and striking silhouettes. Elevate every stride with our exclusive sneaker release.",
    primaryCtaText: "Claim Your Pair",
    primaryCtaHref: "/products?category=4",
    secondaryCtaText: "All Footwear",
    secondaryCtaHref: "/products",
    badgeTitle: "Limited Edition",
    badgeSubtitle: "Selling Fast • While Supplies Last",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80",
    gradientOverlay: "from-slate-950 via-teal-950/90 to-slate-900/60",
    accentColor: "from-emerald-400 via-teal-300 to-cyan-300",
  },
  {
    id: 4,
    tag: "✨ LUXURY EDITION — 25% OFF",
    titlePrimary: "Curated Watches &",
    titleHighlight: "Timeless Essentials",
    description:
      "Precision craftsmanship meets minimalist aesthetics. Discover sophisticated timepieces, leather accessories, and bespoke lifestyle items.",
    primaryCtaText: "Discover Essentials",
    primaryCtaHref: "/products",
    secondaryCtaText: "All Collections",
    secondaryCtaHref: "/products",
    badgeTitle: "100% Certified",
    badgeSubtitle: "Authenticity & 2-Yr Warranty",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80",
    gradientOverlay: "from-slate-950 via-slate-900/90 to-indigo-950/60",
    accentColor: "from-cyan-300 via-sky-300 to-indigo-400",
  },
];

const SLIDE_DURATION = 2000; // Exactly every 2 seconds

export function HomeHeroSlider() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const total = SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  // Automatic slide transition every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [nextSlide]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const activeSlide = SLIDES[current];

  return (
    <div
      className="relative overflow-hidden bg-slate-950 text-white rounded-b-[2rem] sm:rounded-b-[3rem] lg:rounded-b-[4rem] shadow-2xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image & Dynamic Cross-fade */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === current ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            }`}
            style={{ transition: "opacity 700ms cubic-bezier(0.4, 0, 0.2, 1), transform 2500ms ease-out" }}
          >
            <img
              src={slide.imageUrl}
              alt={slide.titlePrimary}
              className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-105"
            />
            {/* Cinematic Gradient Overlays */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradientOverlay}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>
        ))}
      </div>

      {/* Decorative Ambient Glow Lights */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Slide Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20 bg-white/10 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{activeSlide.tag}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] transition-all duration-500">
              {activeSlide.titlePrimary} <br />
              <span
                className={`text-transparent bg-clip-text bg-gradient-to-r ${activeSlide.accentColor}`}
              >
                {activeSlide.titleHighlight}
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {activeSlide.description}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link href={activeSlide.primaryCtaHref} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="primary"
                  icon={ArrowRight}
                  className="w-full sm:w-auto font-black shadow-xl shadow-indigo-600/30 text-sm sm:text-base"
                >
                  {activeSlide.primaryCtaText}
                </Button>
              </Link>
              <Link href={activeSlide.secondaryCtaHref} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  icon={ShoppingBag}
                  className="w-full sm:w-auto text-white border-slate-700 hover:bg-slate-800/80 hover:border-slate-600 backdrop-blur-sm text-sm sm:text-base font-semibold"
                >
                  {activeSlide.secondaryCtaText}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual Card with Deal Badge */}
          <div className="lg:col-span-5 relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-slate-900/40 backdrop-blur-md p-3 sm:p-4 group">
              <div className="relative h-[260px] sm:h-[340px] lg:h-[380px] w-full rounded-2xl overflow-hidden">
                <img
                  src={activeSlide.imageUrl}
                  alt={activeSlide.titlePrimary}
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Glassmorphic Deal Highlight Pill */}
              <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-7 p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/15 flex items-center justify-between gap-3 shadow-xl">
                <div>
                  <span className="text-[10px] sm:text-xs text-indigo-400 font-extrabold uppercase tracking-wider block">
                    {activeSlide.badgeTitle}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white block truncate">
                    {activeSlide.badgeSubtitle}
                  </span>
                </div>
                <Link href={activeSlide.primaryCtaHref}>
                  <button className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shrink-0 shadow-md">
                    Claim Deal
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Controls: Indicator Pills & Chevrons */}
        <div className="pt-8 sm:pt-12 flex items-center justify-between gap-4 border-t border-white/10 mt-8 sm:mt-12">
          {/* Slide Indicator Pills */}
          <div className="flex items-center gap-2">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === current;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 sm:w-10 bg-indigo-500 shadow-md shadow-indigo-500/50"
                      : "w-2 sm:w-2.5 bg-slate-700 hover:bg-slate-600"
                  }`}
                />
              );
            })}

            <span className="text-xs font-mono text-slate-400 ml-2">
              0{current + 1} / 0{total}
            </span>
          </div>

          {/* Navigation Chevron Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="p-2 sm:p-2.5 rounded-full bg-slate-900/80 hover:bg-indigo-600 border border-slate-700/80 hover:border-indigo-500 text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="p-2 sm:p-2.5 rounded-full bg-slate-900/80 hover:bg-indigo-600 border border-slate-700/80 hover:border-indigo-500 text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Trust Badges Bar (Production Quality Standard) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Free Shipping</span>
              <span className="text-[11px] text-slate-400">On all orders over $50</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">100% Authentic</span>
              <span className="text-[11px] text-slate-400">Guaranteed quality</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Easy 30-Day Returns</span>
              <span className="text-[11px] text-slate-400">Hassle-free refunds</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">24/7 Live Support</span>
              <span className="text-[11px] text-slate-400">Dedicated assistance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
