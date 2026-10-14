"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import {
  selectOrders,
  hydrateOrders,
  cancelOrder,
  requestReturn,
} from "@/redux/slices/orderSlice";
import { addToast } from "@/redux/slices/uiSlice";
import { formatCurrency, cleanImageUrl } from "@/utils/formatters";
import { ORDER_STATUSES } from "@/data/mockOrders";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Eye,
  MapPin,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export default function AccountOrdersPage() {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);

  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: "", orderId: "" });
  const [actionReason, setActionReason] = useState("");

  useEffect(() => {
    dispatch(hydrateOrders());
  }, [dispatch]);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "All") return true;
    return o.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case ORDER_STATUSES.DELIVERED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case ORDER_STATUSES.SHIPPED:
      case ORDER_STATUSES.OUT_FOR_DELIVERY:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case ORDER_STATUSES.CANCELLED:
        return "bg-rose-50 text-rose-700 border-rose-200";
      case ORDER_STATUSES.RETURN_REQUESTED:
      case ORDER_STATUSES.RETURNED:
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleConfirmAction = () => {
    if (!actionModal.orderId) return;

    if (actionModal.type === "cancel") {
      dispatch(cancelOrder({ orderId: actionModal.orderId, reason: actionReason }));
      dispatch(addToast({ message: `Order ${actionModal.orderId} cancelled`, type: "info" }));
    } else if (actionModal.type === "return") {
      dispatch(requestReturn({ orderId: actionModal.orderId, reason: actionReason }));
      dispatch(addToast({ message: `Return requested for ${actionModal.orderId}`, type: "success" }));
    }

    setActionModal({ isOpen: false, type: "", orderId: "" });
    setActionReason("");
    if (selectedOrder && selectedOrder.id === actionModal.orderId) {
      setSelectedOrder(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Order History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View past orders, track shipments, and manage returns
          </p>
        </div>

        <Link href="/track-order">
          <Button variant="outline" size="sm" icon={Truck}>
            Live Package Tracker
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {["All", ORDER_STATUSES.DELIVERED, ORDER_STATUSES.SHIPPED, ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              filterStatus === status
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <EmptyState
            icon={Package}
            title="No Orders Found"
            description={
              filterStatus === "All"
                ? "You haven't placed any orders yet. Browse our products and make your first purchase!"
                : `No orders matching status "${filterStatus}".`
            }
            actionText="Start Shopping"
            actionHref="/products"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const canCancel =
              order.status === ORDER_STATUSES.PENDING ||
              order.status === ORDER_STATUSES.CONFIRMED ||
              order.status === ORDER_STATUSES.PROCESSING;
            const canReturn = order.status === ORDER_STATUSES.DELIVERED;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-indigo-300 transition-all space-y-4"
              >
                {/* Order Top Meta */}
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-slate-900">{order.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500">
                    Ordered on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Items Thumbnails & Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex -space-x-2 shrink-0">
                      {(order.items || []).slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 rounded-xl bg-slate-100 border-2 border-white overflow-hidden shadow-xs"
                        >
                          <img
                            src={cleanImageUrl(item.image, null, item.title)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {order.items?.[0]?.title || "Purchased Product"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {order.items?.length > 1
                          ? `+${order.items.length - 1} more item(s)`
                          : `Qty: ${order.items?.[0]?.quantity || 1}`}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right space-y-0.5">
                    <span className="text-xs text-slate-500 block">Total Amount</span>
                    <span className="text-lg font-black text-indigo-600 block">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Truck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Tracking: <strong className="font-mono text-slate-700">{order.trackingId || "N/A"}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </Button>

                    <Link href={`/track-order?id=${order.id}`}>
                      <Button size="sm" variant="primary">
                        Track Delivery
                      </Button>
                    </Link>

                    {canCancel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActionModal({ isOpen: true, type: "cancel", orderId: order.id })}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        Cancel
                      </Button>
                    )}

                    {canReturn && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActionModal({ isOpen: true, type: "return", orderId: order.id })}
                        className="text-amber-600 hover:bg-amber-50"
                      >
                        Return
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)}>
        {selectedOrder && (
          <div className="space-y-5 p-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                  Order Details
                </span>
                <h2 className="text-lg font-black text-slate-900 font-mono">
                  {selectedOrder.id}
                </h2>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                  selectedOrder.status
                )}`}
              >
                {selectedOrder.status}
              </span>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Purchased Items ({selectedOrder.items?.length || 0})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs p-2 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded bg-white border border-slate-200 font-bold flex items-center justify-center shrink-0">
                        {item.quantity}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{item.title}</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  {selectedOrder.shippingFee === 0 ? "FREE" : formatCurrency(selectedOrder.shippingFee || 0)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900">Total Paid</span>
                <span className="font-black text-indigo-600">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Delivery & Payment Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold block">Delivery Address</span>
                <p className="font-bold text-slate-900">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-slate-500 truncate">{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                <span className="text-slate-400 font-semibold block">Payment Method</span>
                <p className="font-bold text-slate-900">{selectedOrder.paymentMethod || "Card"}</p>
                <p className="text-emerald-600 font-bold">{selectedOrder.paymentStatus || "Paid"}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Link href={`/track-order?id=${selectedOrder.id}`}>
                <Button size="sm" variant="primary">
                  Track Delivery
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Confirmation Modal (Cancel / Return) */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: "", orderId: "" })}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {actionModal.type === "cancel" ? "Cancel Order?" : "Request Order Return?"}
              </h3>
              <p className="text-xs text-slate-500">Order ID: {actionModal.orderId}</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Reason for {actionModal.type === "cancel" ? "Cancellation" : "Return"}
            </label>
            <select
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Select a reason...</option>
              <option value="Changed mind">Changed my mind</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found better price">Found a better price elsewhere</option>
              <option value="Item defective or damaged">Item defective or damaged</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionModal({ isOpen: false, type: "", orderId: "" })}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmAction}
              className={actionModal.type === "cancel" ? "bg-rose-600 hover:bg-rose-700" : ""}
            >
              Confirm {actionModal.type === "cancel" ? "Cancellation" : "Return Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

