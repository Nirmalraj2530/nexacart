"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";

export function ProductSort({ currentSort, onSortChange, totalItems }) {
  const options = [
    { label: "Latest", value: "latest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Name: A-Z", value: "name_asc" },
    { label: "Name: Z-A", value: "name_desc" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="font-bold text-slate-900">{totalItems}</span> products
      </div>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider shrink-0">
          Sort By:
        </span>
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
