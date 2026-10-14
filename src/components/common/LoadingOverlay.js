"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

export function LoadingOverlay({ message = "Loading Nexacart...", submessage = "Preparing catalog items & offers..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md transition-all duration-300">
      <div className="relative bg-white/95 backdrop-blur-xl border border-white/60 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-indigo-600/20 max-w-xs w-full text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
        {/* Outer glowing pulsing glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-lg pointer-events-none" />

        {/* Dual Ring Animated Spinner with Center Icon */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Subtle outer static ring */}
          <div className="w-16 h-16 rounded-full border-4 border-slate-100" />
          {/* High-speed gradient spinning ring */}
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-600 border-r-purple-600 animate-spin" />
          {/* Pulsing Center Icon */}
          <div className="absolute p-2.5 rounded-full bg-indigo-50 text-indigo-600 animate-pulse">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            {message}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {submessage}
          </p>
        </div>

        {/* Pulsing indicator dots */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
