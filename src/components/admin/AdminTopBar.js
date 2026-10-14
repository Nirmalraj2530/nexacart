"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  ChevronRight,
  LogOut,
  User,
  Shield,
  ShieldCheck,
} from "lucide-react";

export function AdminTopBar({ onToggleSidebar }) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  // Dynamic Breadcrumb Generator
  const buildBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = [];

    // Base root
    crumbs.push({ label: "Admin", href: "/admin" });

    if (parts.length === 1 && parts[0] === "admin") {
      crumbs.push({ label: "Dashboard", href: "/admin", current: true });
      return crumbs;
    }

    if (parts.length > 1) {
      if (parts[1] === "products") {
        crumbs.push({ label: "Products", href: "/admin/products", current: parts.length === 2 });
        if (parts[2] === "create") {
          crumbs.push({ label: "Create Product", href: "/admin/products/create", current: true });
        } else if (parts[2] === "edit") {
          crumbs.push({
            label: parts[3] ? `Edit Product #${parts[3]}` : "Edit Product",
            href: pathname,
            current: true,
          });
        }
      } else if (parts[1] === "categories") {
        crumbs.push({ label: "Categories", href: "/admin/categories", current: true });
      } else if (parts[1] === "users") {
        crumbs.push({ label: "Users & Roles", href: "/admin/users", current: true });
      } else {
        crumbs.push({
          label: parts[1].charAt(0).toUpperCase() + parts[1].slice(1),
          href: pathname,
          current: true,
        });
      }
    }

    return crumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <header className="admin-topbar">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="admin-topbar-left">
        <button
          onClick={onToggleSidebar}
          className="admin-sidebar-mobile-toggle"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu style={{ width: "1.25rem", height: "1.25rem" }} />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <ChevronRight className="admin-breadcrumb-separator" style={{ width: "0.875rem", height: "0.875rem" }} />
              )}
              {crumb.current ? (
                <span className="admin-breadcrumb-current">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="admin-breadcrumb-link">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Profile & Logout */}
      <div className="admin-topbar-right">
        {/* Admin Profile Menu */}
        <div className="admin-profile-pill">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "Admin"}
              className="admin-profile-avatar"
            />
          ) : (
            <div className="admin-profile-avatar-fallback">
              <User style={{ width: "0.875rem", height: "0.875rem" }} />
            </div>
          )}
          <div className="admin-profile-details">
            <span className="admin-profile-name">{user?.name || "Admin"}</span>
            <span
              className="admin-profile-role"
              style={{
                color: role === "Admin" ? "#4f46e5" : "#9333ea",
              }}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="admin-topbar-logout-btn"
          title="Sign Out"
        >
          <LogOut style={{ width: "1rem", height: "1rem" }} />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
