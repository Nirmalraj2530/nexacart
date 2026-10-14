"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency } from "@/utils/formatters";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  Info,
} from "lucide-react";

export function SalesVelocityChart({ data = [] }) {
  const [activeMetric, setActiveMetric] = useState("revenue"); // "revenue" | "orders"
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Fallback demo dataset if data is empty
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    return [
      { date: "Oct 7", day: "Mon", revenue: 1248.5, orders: 14 },
      { date: "Oct 8", day: "Tue", revenue: 876.25, orders: 9 },
      { date: "Oct 9", day: "Wed", revenue: 2134.0, orders: 23 },
      { date: "Oct 10", day: "Thu", revenue: 1567.75, orders: 18 },
      { date: "Oct 11", day: "Fri", revenue: 3210.0, orders: 31 },
      { date: "Oct 12", day: "Sat", revenue: 2890.5, orders: 27 },
      { date: "Oct 13", day: "Sun", revenue: 1756.0, orders: 19 },
    ];
  }, [data]);

  // Aggregate metrics
  const totals = useMemo(() => {
    const totalRev = chartData.reduce((acc, d) => acc + (d.revenue || 0), 0);
    const totalOrd = chartData.reduce((acc, d) => acc + (d.orders || 0), 0);
    const maxRev = Math.max(...chartData.map((d) => d.revenue || 0), 1);
    const maxOrd = Math.max(...chartData.map((d) => d.orders || 0), 1);
    const avgRev = totalRev / (chartData.length || 1);
    const avgOrd = totalOrd / (chartData.length || 1);

    const peakRevItem = chartData.reduce((prev, curr) =>
      (curr.revenue || 0) > (prev.revenue || 0) ? curr : prev, chartData[0] || {}
    );
    const peakOrdItem = chartData.reduce((prev, curr) =>
      (curr.orders || 0) > (prev.orders || 0) ? curr : prev, chartData[0] || {}
    );

    return {
      totalRevenue: totalRev,
      totalOrders: totalOrd,
      maxRevenue: maxRev,
      maxOrders: maxOrd,
      avgRevenue: avgRev,
      avgOrders: avgOrd,
      peakRevenueItem: peakRevItem,
      peakOrdersItem: peakOrdItem,
    };
  }, [chartData]);

  const isRevenue = activeMetric === "revenue";
  const maxValue = isRevenue ? totals.maxRevenue : totals.maxOrders;
  const peakItem = isRevenue ? totals.peakRevenueItem : totals.peakOrdersItem;

  // Selected item (defaults to peak item when not hovered)
  const activeItem = hoveredIndex !== null ? chartData[hoveredIndex] : peakItem;

  // Y-axis grid scale points (4 levels: 100%, 66%, 33%, 0%)
  const yTicks = useMemo(() => {
    if (isRevenue) {
      const top = Math.ceil(totals.maxRevenue / 1000) * 1000;
      return [top, Math.round((top * 2) / 3), Math.round(top / 3), 0];
    } else {
      const top = Math.ceil(totals.maxOrders / 10) * 10;
      return [top, Math.round((top * 2) / 3), Math.round(top / 3), 0];
    }
  }, [isRevenue, totals.maxRevenue, totals.maxOrders]);

  const topScale = yTicks[0] || 1;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6 w-full min-w-0 overflow-hidden">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              7-Day Sales & Revenue Velocity
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tap or hover over bars to inspect daily gross volume, order velocity, and AOV
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl self-start sm:self-auto border border-slate-200/70">
          <button
            type="button"
            onClick={() => setActiveMetric("revenue")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isRevenue
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Revenue</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("orders")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isRevenue
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-br from-slate-50 to-indigo-50/40 p-4 rounded-2xl border border-slate-200/60">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            7-Day Total
          </span>
          <span className="text-base sm:text-lg font-black text-slate-900">
            {isRevenue ? formatCurrency(totals.totalRevenue) : `${totals.totalOrders} orders`}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Daily Average
          </span>
          <span className="text-base sm:text-lg font-black text-indigo-600">
            {isRevenue ? formatCurrency(totals.avgRevenue) : `${totals.avgOrders.toFixed(1)} / day`}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Peak Performance
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-600 flex items-center gap-1">
            {isRevenue
              ? formatCurrency(totals.peakRevenueItem.revenue || 0)
              : `${totals.peakOrdersItem.orders || 0} orders`}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Peak Date
          </span>
          <span className="text-base sm:text-lg font-black text-slate-700">
            {peakItem.date || "N/A"}
          </span>
        </div>
      </div>

      {/* Dynamic Active Inspector Pill */}
      {activeItem && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm text-xs transition-all">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              <strong>{activeItem.date}</strong> ({activeItem.day || "Day"}):
            </span>
            <span className="font-extrabold text-white text-sm">
              {formatCurrency(activeItem.revenue || 0)}
            </span>
            <span className="text-indigo-200">
              • {activeItem.orders} orders
            </span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span className="text-indigo-200">AOV:</span>
            <strong className="text-white">
              {formatCurrency(
                activeItem.orders > 0 ? (activeItem.revenue || 0) / activeItem.orders : 0
              )}
            </strong>
            <span className="bg-indigo-500/80 px-2 py-0.5 rounded-full text-[10px] font-bold ml-1">
              {activeItem.revenue >= totals.avgRevenue ? "Above Avg" : "Below Avg"}
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="relative pt-4 pb-2 w-full">
        {/* Horizontal Background Guidelines */}
        <div className="absolute inset-x-0 top-4 bottom-10 flex flex-col justify-between pointer-events-none pl-10 sm:pl-14">
          {yTicks.map((tick, i) => (
            <div key={i} className="flex items-center w-full border-b border-dashed border-slate-200/80 h-0">
              <span className="text-[10px] font-mono font-semibold text-slate-400 -translate-y-2 -translate-x-10 sm:-translate-x-14 absolute left-0 w-8 sm:w-12 text-right">
                {isRevenue ? (tick >= 1000 ? `$${tick / 1000}k` : `$${tick}`) : tick}
              </span>
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="h-56 sm:h-64 pl-10 sm:pl-14 flex items-end justify-between gap-1.5 sm:gap-3 md:gap-4 relative z-10">
          {chartData.map((item, idx) => {
            const val = isRevenue ? item.revenue : item.orders;
            const heightPct = Math.min(100, Math.max(10, Math.round((val / topScale) * 100)));
            const isHovered = hoveredIndex === idx;
            const isPeak = (isRevenue ? item.revenue : item.orders) === maxValue;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(idx)}
                className="flex-1 min-w-0 flex flex-col items-center h-full justify-end cursor-pointer group relative"
              >
                {/* Floating Tooltip Bubble on Hover / Focus */}
                <div
                  className={`absolute -top-12 z-30 pointer-events-none transition-all duration-200 transform ${
                    isHovered
                      ? "opacity-100 scale-100 -translate-y-1"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="bg-slate-900 text-white text-[10px] sm:text-xs font-bold py-1 px-2.5 rounded-xl shadow-xl whitespace-nowrap flex items-center gap-1.5">
                    <span>{isRevenue ? formatCurrency(item.revenue) : `${item.orders} orders`}</span>
                    {isPeak && <span className="text-amber-300">★ Peak</span>}
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
                </div>

                {/* Track Column (Full Height) */}
                <div className="w-full max-w-[36px] sm:max-w-[48px] h-full flex items-end justify-center rounded-2xl p-1 bg-slate-50/60 group-hover:bg-indigo-50/60 transition-colors">
                  {/* Active Animated Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-xl transition-all duration-300 relative ${
                      isPeak
                        ? "bg-gradient-to-t from-indigo-700 via-indigo-600 to-violet-400 shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400/30"
                        : isHovered
                        ? "bg-gradient-to-t from-indigo-600 via-indigo-500 to-violet-400 shadow-md shadow-indigo-500/25"
                        : "bg-gradient-to-t from-indigo-600/90 to-indigo-500/90 group-hover:from-indigo-600 group-hover:to-violet-400"
                    }`}
                  >
                    {/* Top Glow Accent */}
                    <div className="h-1.5 w-full bg-white/40 rounded-t-xl" />

                    {/* Peak badge indicator on bar */}
                    {isPeak && (
                      <span className="hidden sm:block absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-black text-indigo-700">
                        ★
                      </span>
                    )}
                  </div>
                </div>

                {/* X-Axis Date Label */}
                <div className="text-center mt-2 w-full">
                  <span
                    className={`text-[10px] sm:text-xs font-bold block transition-colors ${
                      isHovered || isPeak
                        ? "text-indigo-600 font-black"
                        : "text-slate-600 group-hover:text-slate-900"
                    }`}
                  >
                    {item.date}
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 block -mt-0.5">
                    {item.day || ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Help Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-400" />
            <span>Regular Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-700 ring-2 ring-indigo-400/50" />
            <span className="font-semibold text-indigo-700">Peak Day (★)</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Calculated from demo transaction store</span>
        </div>
      </div>
    </div>
  );
}

