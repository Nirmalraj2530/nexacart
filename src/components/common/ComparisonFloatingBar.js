"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  selectComparisonItems,
  removeFromComparison,
  clearComparison,
  hydrateComparison,
} from "@/redux/slices/comparisonSlice";
import { useMounted } from "@/hooks/useMounted";
import { cleanImageUrl } from "@/utils/formatters";
import { Scale, X, ArrowRight } from "lucide-react";

export function ComparisonFloatingBar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const items = useSelector(selectComparisonItems);
  const mounted = useMounted();

  useEffect(() => {
    dispatch(hydrateComparison());
  }, [dispatch]);

  // Don't show on admin pages or on the compare page itself
  if (!mounted || items.length === 0 || pathname?.startsWith("/admin") || pathname === "/compare") {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm sm:max-w-md bg-slate-900/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-slate-700/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
            <Scale className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-tight">
            Compare Products ({items.length}/4)
          </span>
        </div>
        <button
          onClick={() => dispatch(clearComparison())}
          className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Thumbnails */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="relative group w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
              <img
                src={cleanImageUrl(item.image, null, item.title)}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => dispatch(removeFromComparison(item.id))}
                className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="w-10 h-10 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-500 shrink-0"
            >
              +
            </div>
          ))}
        </div>

        {/* Action Link */}
        <Link
          href="/compare"
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
        >
          Compare <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

