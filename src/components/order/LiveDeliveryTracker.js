"use client";

import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { addToast } from "@/redux/slices/uiSlice";
import { ORDER_STATUSES } from "@/data/mockOrders";
import {
  ShoppingBag,
  ShieldCheck,
  Package,
  Truck,
  Navigation,
  Home,
  CheckCircle2,
  Phone,
  Share2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Copy,
  Sparkles,
  Info,
} from "lucide-react";

const STAGE_CONFIG = [
  {
    key: ORDER_STATUSES.PENDING,
    label: "Order Placed",
    title: "Order Placed & Payment Secured",
    desc: "Order has been registered in the system and payment verified.",
    location: "NexaCart Online Checkout",
    pct: 12,
    icon: ShoppingBag,
    color: "from-blue-600 to-indigo-600",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    key: ORDER_STATUSES.CONFIRMED,
    label: "Order Confirmed",
    title: "Order Confirmed & Approved",
    desc: "Merchant verified stock allocation and generated fulfillment manifest.",
    location: "SF Automated Distribution Center",
    pct: 28,
    icon: ShieldCheck,
    color: "from-indigo-600 to-cyan-600",
    badgeColor: "bg-indigo-100 text-indigo-700",
  },
  {
    key: ORDER_STATUSES.PROCESSING,
    label: "Processing",
    title: "Packaging & Quality Inspection",
    desc: "Merchandise inspected, safely boxed, and sealed with tamper-proof security tape.",
    location: "San Francisco Bay Fulfillment Hub A",
    pct: 48,
    icon: Package,
    color: "from-purple-600 to-indigo-600",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    key: ORDER_STATUSES.SHIPPED,
    label: "Shipped",
    title: "In Transit — Line-Haul Express",
    desc: "Package left central sorting hub and is traveling via regional transit network.",
    location: "Bay Area Interstate Line-Haul Hub",
    pct: 70,
    icon: Truck,
    color: "from-cyan-600 to-blue-600",
    badgeColor: "bg-cyan-100 text-cyan-800",
  },
  {
    key: ORDER_STATUSES.OUT_FOR_DELIVERY,
    label: "Out for Delivery",
    title: "Out with Delivery Driver",
    desc: "Loaded onto local courier van. Courier is en route to recipient destination.",
    location: "Local Delivery Van #NX-418 (Near Your Area)",
    pct: 88,
    icon: Navigation,
    color: "from-amber-500 to-orange-600",
    badgeColor: "bg-amber-100 text-amber-800",
  },
  {
    key: ORDER_STATUSES.DELIVERED,
    label: "Delivered",
    title: "Delivered to Recipient",
    desc: "Package delivered safely to destination address and signed for by recipient.",
    location: "Recipient Front Porch / Mailbox",
    pct: 100,
    icon: Home,
    color: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
];

export function LiveDeliveryTracker({ order, onStatusChange }) {
  const dispatch = useDispatch();
  // Allow interactive simulation of stage if user clicks simulator pills
  const [simulatedStatus, setSimulatedStatus] = useState(order?.status || ORDER_STATUSES.SHIPPED);

  // Sync when order changes
  const activeStatus = simulatedStatus;

  // Find index of current stage
  const currentStageIndex = useMemo(() => {
    const idx = STAGE_CONFIG.findIndex((s) => s.key === activeStatus);
    return idx >= 0 ? idx : 3; // Default to shipped if unknown
  }, [activeStatus]);

  const currentStage = STAGE_CONFIG[currentStageIndex];
  const progressPct = currentStage?.pct || 50;
  const isDelivered = currentStageIndex === STAGE_CONFIG.length - 1;

  // Base timestamps generator for milestones
  const baseTime = useMemo(() => new Date(order?.createdAt || Date.now() - 3 * 86400000), [order?.createdAt]);

  const handleCopyTracking = () => {
    const code = order?.trackingId || "TRK-SF-88421";
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      dispatch(addToast({ message: `Tracking code ${code} copied to clipboard!`, type: "success" }));
    }
  };

  const handleCallDriver = () => {
    dispatch(
      addToast({
        message: "Connecting call to Courier Associate Marcus R. (+1 555-019-3829)...",
        type: "info",
      })
    );
  };

  const handleShareTracking = () => {
    if (navigator?.clipboard?.writeText && typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      dispatch(addToast({ message: "Live tracking link copied to clipboard!", type: "success" }));
    }
  };

  return (
    <div className="space-y-8">
      {/* ── 1. Interactive Demo Simulator Bar ── */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 rounded-3xl border border-indigo-100/80 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: "6s" }} />
            <span className="text-xs font-bold text-slate-800">
              Interactive Stage Simulator:
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline">
              (Click any stage to test live vehicle driving animations)
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-indigo-600 border border-indigo-200">
            Real-time Animation
          </span>
        </div>

        {/* Stage Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {STAGE_CONFIG.map((stage, idx) => {
            const isSelected = activeStatus === stage.key;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => {
                  setSimulatedStatus(stage.key);
                  if (onStatusChange) onStatusChange(stage.key);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 scale-102"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
                }`}
              >
                <span>{stage.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Hero Live Highway Road & Moving Vehicle Canvas ── */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden space-y-6">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Status Header inside Road Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {isDelivered ? "Delivered & Completed" : "Live In-Transit Telemetry"}
              </span>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                GPS Fleet Active
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {currentStage?.title}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Current Hub: <strong>{currentStage?.location}</strong></span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Completion Progress
            </span>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl font-black text-white font-mono">{progressPct}%</span>
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <span className="text-[11px] text-indigo-300 font-medium">
              {isDelivered ? "Doorstep Drop-off Done" : "Estimated Today"}
            </span>
          </div>
        </div>

        {/* ── Highway Track & Moving Vehicle Visual ── */}
        <div className="relative pt-8 pb-6 px-4 sm:px-8 z-10">
          {/* Start and End Icons */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-bold px-1">
            <div className="flex items-center gap-1.5 text-indigo-300">
              <div className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
                <Package className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">Dispatch Hub (SF)</span>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-300">
              <span className="hidden sm:inline">Destination (Home)</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                <Home className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Road Surface */}
          <div className="relative h-14 sm:h-16 bg-slate-900 rounded-2xl border-2 border-slate-700/80 shadow-inner flex items-center px-4 overflow-hidden">
            {/* Top & Bottom Curb Stripes */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-60" />
            <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-60" />

            {/* Road Animated Center Dashes (SVG) */}
            <svg className="w-full h-4 absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none" preserveAspectRatio="none">
              <line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#64748b"
                strokeWidth="2.5"
                strokeDasharray="12 12"
                className="animate-road-dashes opacity-70"
              />
            </svg>

            {/* Progress Road Fill (Gradient glow under vehicle) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-600/30 via-cyan-500/20 to-emerald-500/30 transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />

            {/* ── Animated Delivery Vehicle ── */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-20"
              style={{
                left: `clamp(12px, calc(${progressPct}% - 28px), calc(100% - 68px))`,
              }}
            >
              <div className="relative group">
                {/* Floating Speed / Status Bubble */}
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-600 text-white text-[10px] font-extrabold py-0.5 px-2 rounded-full shadow-lg border border-indigo-400 flex items-center gap-1">
                  <span>{isDelivered ? "🎉 Arrived!" : "🚚 52 mph"}</span>
                </div>

                {/* Headlight Beam Effect */}
                {!isDelivered && (
                  <div className="absolute left-10 top-2 w-16 h-8 bg-gradient-to-r from-amber-300/40 via-amber-200/10 to-transparent blur-xs transform -rotate-6 pointer-events-none animate-headlight" />
                )}

                {/* Delivery Vehicle Container */}
                <div className={`p-2 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/50 border border-indigo-400/80 ${!isDelivered ? "animate-vehicle-bob" : "bg-emerald-600 border-emerald-400 shadow-emerald-600/40"}`}>
                  {isDelivered ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : currentStageIndex === 4 ? (
                    <Navigation className="w-6 h-6 text-white animate-spin" style={{ animationDuration: "8s" }} />
                  ) : (
                    <Truck className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Pulsing Underglow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-indigo-400/60 rounded-full blur-xs" />
              </div>
            </div>
          </div>

          {/* Road Milestones Sub-Labels */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
            <span>Mile 0: Packed</span>
            <span className="hidden sm:inline">Hub Transfer</span>
            <span>Final Mile: Doorstep</span>
          </div>
        </div>

        {/* Action Controls Inside Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Carrier:</span>
            <span className="font-bold text-white">NexaExpress Priority Air</span>
            <span className="text-slate-500">•</span>
            <button
              onClick={handleCopyTracking}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono hover:underline"
            >
              <span>{order?.trackingId || "TRK-SF-88421"}</span>
              <Copy className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCallDriver}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors text-xs"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Contact Driver</span>
            </button>
            <button
              onClick={handleShareTracking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors text-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Step-by-Step Milestones with DISTINCT ICONS & LIVE ACCENTS ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Milestone Progress History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified timestamps and custody checkpoints for this consignment
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {currentStageIndex + 1} of {STAGE_CONFIG.length} Stages Completed
          </span>
        </div>

        {/* Milestone Vertical Journey List */}
        <div className="relative pl-8 sm:pl-10 space-y-8">
          {STAGE_CONFIG.map((stage, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;
            const Icon = stage.icon;

            // Generate realistic staggered timestamp
            const stepTime = new Date(baseTime.getTime() + idx * 24 * 3600 * 1000).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={stage.key} className="relative group">
                {/* Connecting Line to next step */}
                {idx < STAGE_CONFIG.length - 1 && (
                  <div
                    className={`absolute -left-8 sm:-left-10 top-10 bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-500 ${
                      idx < currentStageIndex
                        ? "bg-emerald-500"
                        : "bg-slate-200 border-dashed"
                    }`}
                    style={{ height: "calc(100% + 2rem)" }}
                  />
                )}

                {/* Milestone Icon Node */}
                <div
                  className={`absolute -left-8 sm:-left-10 top-0 -translate-x-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center transition-all duration-300 z-10 ${
                    isCurrent
                      ? "bg-gradient-to-tr from-indigo-600 to-violet-500 text-white ring-4 ring-indigo-200/80 shadow-lg shadow-indigo-500/30 scale-110"
                      : isCompleted
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />

                  {/* Little checkmark badge on completed stages */}
                  {isCompleted && !isCurrent && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Milestone Details Card */}
                <div
                  className={`rounded-2xl transition-all p-4 ${
                    isCurrent
                      ? "bg-indigo-50/70 border-2 border-indigo-200/90 shadow-xs"
                      : isCompleted
                      ? "bg-white hover:bg-slate-50/70 border border-slate-100"
                      : "opacity-60"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm sm:text-base font-bold ${
                          isCurrent
                            ? "text-indigo-950 font-black"
                            : isCompleted
                            ? "text-slate-900"
                            : "text-slate-500"
                        }`}
                      >
                        {stage.title}
                      </h4>

                      {/* Current Stage Badge */}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white uppercase tracking-wider animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Live Active
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {isCompleted ? stepTime : "Upcoming Stage"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {stage.desc}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Checkpoint: {stage.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Driver & Assigned Vehicle Details ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Associate Profile */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Driver"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Assigned Courier Driver
            </span>
            <strong className="text-sm font-bold text-slate-900 block">Marcus Rivera</strong>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              ★ 4.96 Rating · 1,480 trips
            </span>
          </div>
        </div>

        {/* Courier Vehicle */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Vehicle & License
            </span>
            <strong className="text-sm font-bold text-slate-900 block">Electric Transit Van</strong>
            <span className="text-xs font-mono text-slate-500">Plate: CA-7XYZ42 (Fleet #18)</span>
          </div>
        </div>

        {/* Safe Delivery Guarantee */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Protection Guarantee
            </span>
            <strong className="text-sm font-bold text-slate-900 block">100% Insured Transit</strong>
            <span className="text-xs text-slate-500">Contactless doorstep delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
