"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/services/productApi";
import { addToast } from "@/redux/slices/uiSlice";
import { formatCurrency } from "@/utils/formatters";
import { ORDER_STATUSES } from "@/data/mockOrders";
import { TableSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ClipboardList, Package, Truck, CheckCircle2, Clock } from "lucide-react";

const STATUS_OPTIONS = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.CONFIRMED,
  ORDER_STATUSES.PROCESSING,
  ORDER_STATUSES.SHIPPED,
  ORDER_STATUSES.OUT_FOR_DELIVERY,
  ORDER_STATUSES.DELIVERED,
  ORDER_STATUSES.CANCELLED,
  ORDER_STATUSES.RETURN_REQUESTED,
  ORDER_STATUSES.RETURNED,
  ORDER_STATUSES.REFUNDED,
];

export default function AdminOrdersPage() {
  const dispatch = useDispatch();
  const { data: orders = [], isLoading, isError, error, refetch } = useGetAllOrdersQuery();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = orders.filter((o) =>
    statusFilter === "All" ? true : o.status === statusFilter
  );

  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      await updateOrderStatus({ orderId, status: nextStatus }).unwrap();
      dispatch(
        addToast({
          message: `Order ${orderId} marked as "${nextStatus}"`,
          type: "success",
        })
      );
    } catch (err) {
      dispatch(
        addToast({
          message: err?.friendlyMessage || err?.data?.message || "Failed to update order status",
          type: "error",
        })
      );
    }
  };

  return (
    <div className="admin-page-container space-y-6">
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            Order Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor customer orders and advance shipping & delivery milestones
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          <Package className="w-4 h-4 text-indigo-600" />
          Total Orders: {orders.length}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map(
          (st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          )
        )}
      </div>

      {/* Orders Table */}
      <div className="admin-table-card">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              title="Failed to Load Orders"
              message={error?.friendlyMessage || error?.data?.message || "Unable to fetch orders."}
              onRetry={refetch}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Truck}
              title="No Orders Found"
              description={
                statusFilter === "All"
                  ? "No customer orders have been placed yet."
                  : `No orders currently have status "${statusFilter}".`
              }
            />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Fulfillment Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="font-mono font-bold text-xs text-slate-900">{order.id}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{order.trackingId}</div>
                    </td>
                    <td>
                      <div className="text-xs font-bold text-slate-800">
                        {order.shippingAddress?.fullName || order.user?.name || "Customer"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600">
                        {(order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0)} item(s)
                      </span>
                    </td>
                    <td>
                      <strong className="text-xs text-slate-900">
                        {formatCurrency(order.total)}
                      </strong>
                    </td>
                    <td>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {order.paymentStatus} ({order.paymentMethod})
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

