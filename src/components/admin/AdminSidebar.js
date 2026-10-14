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
  ShoppingBag,
  LogOut,
  X,
  Shield,
  ShieldCheck,
} from "lucide-react";

export function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, role, isAdmin, isManager, logout } = useAuth();

  // Exactly the 4 permitted admin modules as specified
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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        {/* 1. NexaCart Admin Branding */}
        <div className="admin-sidebar-header">
          <Link href="/admin" className="admin-brand-logo" onClick={onClose}>
            <div className="admin-brand-icon-box">
              <ShoppingBag style={{ width: "1.25rem", height: "1.25rem" }} />
            </div>
            <div className="admin-brand-text-wrap">
              <span className="admin-brand-title">
                Nexa<span className="brand-highlight">cart</span>
              </span>
              <span className="admin-brand-badge">Admin Panel</span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="admin-sidebar-close-btn"
            aria-label="Close Admin Sidebar"
          >
            <X style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        </div>

        {/* 2. Admin Sidebar Navigation - ONLY 4 Items */}
        <div className="admin-sidebar-nav-wrap">
          <div className="admin-sidebar-section-label">Management</div>
          <nav className="admin-sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`admin-nav-item ${active ? "active" : ""}`}
                >
                  <Icon className="admin-nav-icon" />
                  <span className="admin-nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. Sidebar Bottom Footer */}
        <div className="admin-sidebar-footer">
          {/* User Profile Card & Logout */}
          <div className="admin-user-card">
            <div className="admin-user-avatar-wrap">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || "Admin"}
                  className="admin-user-avatar"
                />
              ) : (
                <div className="admin-user-avatar-placeholder">
                  <Shield style={{ width: "1rem", height: "1rem" }} />
                </div>
              )}
            </div>

            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || "Admin User"}</span>
              <span
                className="admin-user-role-tag"
                style={{
                  color: role === "Admin" ? "#4f46e5" : "#9333ea",
                }}
              >
                {role}
              </span>
            </div>

            <button
              onClick={logout}
              className="admin-logout-icon-btn"
              title="Sign Out"
            >
              <LogOut style={{ width: "1rem", height: "1rem" }} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
