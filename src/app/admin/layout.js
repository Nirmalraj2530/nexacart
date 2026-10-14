"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && pathname?.startsWith("/admin")) {
      try {
        localStorage.setItem("nexacart_last_admin_path", pathname);
      } catch {}
    }
  }, [pathname]);

  return (
    <AuthGuard requiredRole="Manager">
      <div className="admin-layout-root">
        {/* Dedicated Admin Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Admin Content Column */}
        <div className="admin-layout-main">
          {/* Admin-Specific Top Bar */}
          <AdminTopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

          {/* Main Content Area */}
          <main className="admin-layout-content">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}


