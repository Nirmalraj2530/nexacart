"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectOrders, hydrateOrders } from "@/redux/slices/orderSlice";
import { getOrderTimeline, ORDER_STATUSES } from "@/data/mockOrders";
import { formatCurrency, cleanImageUrl } from "@/utils/formatters";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);

  const initialId = searchParams.get("id") || "";
  const [searchQuery, setSearchQuery] = useState(initialId);
  const [submittedQuery, setSubmittedQuery] = useState(initialId);

  useEffect(() => {
    dispatch(hydrateOrders());
  }, [dispatch]);

  const activeOrder = useMemo(() => {
    const q = (submittedQuery || "").trim().toUpperCase();
    if (!q) return null;
    return (
      orders.find(
        (o) =>
          (o.id && o.id.toUpperCase() === q) ||
          (o.trackingId && o.trackingId.toUpperCase() === q),
      ) || null
    );
  }, [submittedQuery, orders]);

  const searched = Boolean(submittedQuery.trim());

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
  };

  const timeline = activeOrder
    ? getOrderTimeline(activeOrder.status, activeOrder.createdAt)
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      {/* Page Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Live Package Tracking
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Track Your Delivery
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Enter your Nexacart Order ID (e.g.,{" "}
          <code className="font-bold text-slate-800">NEXA-100001</code>) or
          Tracking Number to see milestone progress.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order ID (NEXA-XXXXXX) or Tracking Code"
              className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl border border-slate-200 uppercase font-mono tracking-wide focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={Truck}
            className="font-bold"
          >
            Track Order
          </Button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Try sample orders:</span>
          {orders.slice(0, 3).map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setSearchQuery(o.id);
                setSubmittedQuery(o.id);
              }}
              className="font-mono text-indigo-600 hover:underline bg-indigo-50 px-2 py-0.5 rounded-lg"
            >
              {o.id}
            </button>
          ))}
        </div>
      </div>

      {/* Result Section */}
      {searched && !activeOrder && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">
            No Tracking Records Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find an order matching{" "}
            <code className="font-bold text-slate-800">{searchQuery}</code>.
            Please double check the ID or check your order history.
          </p>
          <Link href="/account/orders">
            <Button variant="outline" size="sm">
              View All Orders
            </Button>
          </Link>
        </div>
      )}

      {activeOrder && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
          {/* Order Header Meta */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Order Tracking
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {activeOrder.id}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Carrier: NexaExpress Priority · Tracking ID:{" "}
                <strong className="font-mono text-slate-800">
                  {activeOrder.trackingId || "Assigned Upon Dispatch"}
                </strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold">
                Estimated Delivery
              </span>
              <span className="text-base font-black text-slate-900 flex items-center gap-1.5 justify-end">
                <Calendar className="w-4 h-4 text-indigo-600" />
                {activeOrder.estimatedDelivery
                  ? new Date(activeOrder.estimatedDelivery).toLocaleDateString(
                      "en-US",
                      { weekday: "short", month: "short", day: "numeric" },
                    )
                  : "Within 3-5 days"}
              </span>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Shipment Progress
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                      step.done
                        ? "bg-emerald-500 ring-4 ring-emerald-100"
                        : "bg-slate-300"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Step Details */}
                  <div className="space-y-0.5 flex-1">
                    <span
                      className={`text-sm font-bold block ${
                        step.done ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {step.done
                        ? new Date(step.time).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Pending stage"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Destination Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 space-y-1 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                Destination Address
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {activeOrder.shippingAddress?.fullName || "Recipient"}
              </p>
              <p className="text-slate-600">
                {activeOrder.shippingAddress?.address},{" "}
                {activeOrder.shippingAddress?.city},{" "}
                {activeOrder.shippingAddress?.state}{" "}
                {activeOrder.shippingAddress?.pincode}
              </p>
              <p className="text-slate-500 font-mono mt-1">
                Phone: {activeOrder.shippingAddress?.phone}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 space-y-2 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                Package Contents ({activeOrder.items?.length || 1} items)
              </span>
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {(activeOrder.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="truncate text-slate-800">
                      {item.quantity}x {item.title}
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-indigo-600 font-black">
                  {formatCurrency(activeOrder.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Link href="/account/orders">
              <Button variant="outline" size="sm" icon={ArrowRight}>
                View in Order History
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-16 text-center text-sm text-slate-500">
          Loading tracking portal...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
