"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  Store,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();
  const { user, role, isAdmin, isManager } = useAuth();

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
      matchPrefix: true,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: FolderTree,
      matchPrefix: true,
    },
    ...(isAdmin
      ? [
          {
            label: "Users & Roles",
            href: "/admin/users",
            icon: Users,
            matchPrefix: true,
          },
        ]
      : []),
  ];

  const isItemActive = (item) => {
    if (item.exact) return pathname === item.href;
    if (item.matchPrefix) return pathname === item.href || pathname.startsWith(`${item.href}/`);
    return pathname === item.href;
  };

  return (
    <div className="admin-subnav-bar">
      <div className="header-container admin-subnav-container">
        {/* Left: Admin Section Title & Nav Tabs */}
        <div className="admin-subnav-left">
          <div className="admin-portal-badge">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="admin-portal-title">Admin Console</span>
            <span
              className="admin-role-pill"
              style={{
                backgroundColor: role === "Admin" ? "rgba(79, 70, 229, 0.15)" : "rgba(147, 51, 234, 0.15)",
                color: role === "Admin" ? "#4f46e5" : "#9333ea",
              }}
            >
              {role || "Manager"}
            </span>
          </div>

          <nav className="admin-tabs-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-tab-link ${active ? "active" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Optional View Storefront Link */}
        <div className="admin-subnav-right">
          <Link
            href="/"
            className="admin-store-link primary"
            title="Preview Customer Storefront"
          >
            <Store className="w-3.5 h-3.5 text-indigo-600" />
            <span>View Storefront</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
