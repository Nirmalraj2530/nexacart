"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { formatCurrency, cleanImageUrl } from "@/utils/formatters";
import { History, ArrowRight } from "lucide-react";

const emptySubscribe = () => () => {};

function getRecentlyViewed(currentProductId) {
  if (typeof window === "undefined") return "[]";
  try {
    const stored = JSON.parse(localStorage.getItem("nexacart_recently_viewed") || "[]");
    const filtered = stored.filter((item) => String(item.id) !== String(currentProductId)).slice(0, 4);
    return JSON.stringify(filtered);
  } catch {
    return "[]";
  }
}

export function RecentlyViewed({ currentProductId }) {
  const rawItems = useSyncExternalStore(
    emptySubscribe,
    () => getRecentlyViewed(currentProductId),
    () => "[]"
  );

  const items = React.useMemo(() => {
    try {
      return JSON.parse(rawItems);
    } catch {
      return [];
    }
  }, [rawItems]);

  if (items.length === 0) return null;

  return (
    <div className="pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Recently Viewed
          </h3>
        </div>
        <Link href="/products" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
          Explore All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.id}`}
            className="group rounded-2xl bg-white border border-slate-200/80 p-3 hover:border-indigo-400 hover:shadow-md transition-all duration-300 block"
          >
            <div className="h-32 rounded-xl bg-slate-100 overflow-hidden mb-2.5">
              <img
                src={cleanImageUrl(item.image, null, item.title)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 block">
              {item.title}
            </span>
            <span className="text-xs font-black text-indigo-600 block mt-0.5">
              {formatCurrency(item.price)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
