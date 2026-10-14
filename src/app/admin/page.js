"use client";

import React from "react";
import Link from "next/link";
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useGetUsersQuery,
} from "@/redux/services/productApi";
import { formatCurrency, cleanImageUrl } from "@/utils/formatters";
import { Button } from "@/components/common/Button";
import { TableSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import {
  MOCK_INVENTORY,
  LOW_STOCK_ALERTS,
  DEMO_SALES_DATA,
  DEMO_KPI,
} from "@/data/mockInventory";
import { SalesVelocityChart } from "@/components/admin/SalesVelocityChart";
import {
  Package,
  Plus,
  Layers,
  Users,
  ArrowRight,
  Eye,
  Edit,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Truck,
  RotateCcw,
  Shield,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useGetProductsQuery();
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: users = [], isLoading: isUsersLoading } = useGetUsersQuery(undefined, { skip: !isAdmin });

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalUsers = users.length;
  const recentProducts = products.slice(0, 5);

  return (
    <div className="admin-page-container space-y-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isAdmin ? "Admin Executive Dashboard" : "Catalog Management Dashboard"}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Live API + Demo Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time catalog inventory, simulated revenue trends, order fulfillment stats, and low-stock alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/admin/products/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Create Product
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="outline" size="sm" icon={Package}>
              Manage Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products (Live API) */}
        <Link href="/admin/products" className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Products</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block mt-2">
            {isProductsLoading ? "..." : totalProducts}
          </span>
          <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1">
            API Managed Catalog <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Categories (Live API) */}
        <Link href="/admin/categories" className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Categories</span>
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block mt-2">
            {isCategoriesLoading ? "..." : totalCategories}
          </span>
          <span className="text-xs text-purple-600 font-semibold flex items-center gap-1 mt-1">
            Manage hierarchy <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Demo 7-Day Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Weekly Revenue</span>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded ml-1.5">Demo</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block mt-2">
            {formatCurrency(DEMO_KPI.totalRevenue)}
          </span>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +{DEMO_KPI.revenueGrowth}% vs last week
          </span>
        </div>

        {/* Active Users or Total Orders */}
        {isAdmin ? (
          <Link href="/admin/users" className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Users</span>
              <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-900 block mt-2">
              {isUsersLoading ? "..." : totalUsers}
            </span>
            <span className="text-xs text-sky-600 font-semibold flex items-center gap-1 mt-1">
              Admin user control <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Demo Orders Count</span>
              <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-600">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-black text-slate-900 block mt-2">
              {DEMO_KPI.totalOrders}
            </span>
            <span className="text-xs text-slate-500 font-semibold block mt-1">
              +{DEMO_KPI.ordersGrowth}% fulfillment velocity
            </span>
          </div>
        )}
      </div>

      {/* Analytics & Charts Section (Simulated) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Revenue Velocity Chart (2 cols) */}
        <div className="lg:col-span-2 min-w-0 w-full">
          <SalesVelocityChart data={DEMO_SALES_DATA} />
        </div>

        {/* Order Status Distribution Chart (1 col) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Order Status Distribution</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Current state of active customer orders</p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: "Delivered", count: DEMO_KPI.deliveredOrders, color: "bg-emerald-500", pct: 62 },
              { label: "Shipped & In Transit", count: DEMO_KPI.shippedOrders, color: "bg-indigo-500", pct: 24 },
              { label: "Processing & Pending", count: DEMO_KPI.pendingOrders, color: "bg-amber-500", pct: 9 },
              { label: "Cancelled Orders", count: DEMO_KPI.cancelledOrders, color: "bg-rose-500", pct: 5 },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{stat.label}</span>
                  <span className="font-bold text-slate-900">{stat.count} ({stat.pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Simulated breakdown for portfolio presentation. Real orders sync to your browser localStorage.
          </div>
        </div>
      </div>

      {/* Low-Stock Inventory Table */}
      <div className="admin-table-card">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Low Stock Inventory Alerts</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Products with inventory near or below reorder safety thresholds</p>
          </div>
          <span className="text-xs font-bold text-slate-400">{LOW_STOCK_ALERTS.length} Alerts Active</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Units</th>
                <th>Reorder Level</th>
                <th>Alert Status</th>
              </tr>
            </thead>
            <tbody>
              {LOW_STOCK_ALERTS.map((alert) => (
                <tr key={alert.productId}>
                  <td>
                    <strong className="text-slate-900 text-xs">{alert.productTitle}</strong>
                  </td>
                  <td>
                    <span className="text-xs text-slate-500">{alert.category}</span>
                  </td>
                  <td>
                    <strong className="text-slate-900 font-mono text-xs">{alert.currentStock} units</strong>
                  </td>
                  <td>
                    <span className="text-xs text-slate-500 font-mono">{alert.reorderLevel} units</span>
                  </td>
                  <td>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        alert.status === "critical"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Added Products Table (Live API) */}
      <div className="admin-table-card">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recently Added Products (Live API)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest items retrieved directly from the EscuelaJS catalog</p>
          </div>
          <Link href="/admin/products">
            <Button variant="ghost" size="sm" icon={ArrowRight}>
              View All Products
            </Button>
          </Link>
        </div>

        {isProductsLoading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : isProductsError ? (
          <div className="p-6">
            <ErrorState
              title="Failed to Load Recent Products"
              message={productsError?.data?.message || "Could not retrieve products from API."}
              onRetry={refetchProducts}
            />
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No Products Available"
              description="Your store inventory is currently empty."
              actionText="Create Product"
              actionHref="/admin/products/create"
            />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="flex items-center gap-3">
                      <img
                        src={cleanImageUrl(p.images || p.image, null, p.category?.name || p.title)}
                        alt=""
                        className="table-img"
                      />
                      <strong className="text-slate-900 text-xs">{p.title}</strong>
                    </td>
                    <td>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {p.category?.name || "General"}
                      </span>
                    </td>
                    <td>
                      <strong className="text-slate-900 text-xs">{formatCurrency(p.price)}</strong>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="flex justify-end gap-1">
                        <Link href={`/products/${p.id}`}>
                          <button className="btn btn-ghost btn-sm" title="View Customer Page">
                            <Eye className="w-4 h-4 text-slate-400" />
                          </button>
                        </Link>
                        <Link href={`/admin/products/edit/${p.id}`}>
                          <button className="btn btn-ghost btn-sm" title="Edit In Admin">
                            <Edit className="w-4 h-4 text-slate-400" />
                          </button>
                        </Link>
                      </div>
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
