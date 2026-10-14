"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { selectCartTotalCount } from "@/redux/slices/cartSlice";
import { selectWishlistCount } from "@/redux/slices/wishlistSlice";
import { selectComparisonCount } from "@/redux/slices/comparisonSlice";
import {
  selectMobileMenuOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
} from "@/redux/slices/uiSlice";
import {
  selectAuthUser,
  selectIsAuthenticated,
  openLoginModal,
  openRegisterModal,
  setUserProfile,
  logout,
} from "@/redux/slices/authSlice";
import { useLazyGetUserProfileQuery } from "@/redux/services/productApi";
import { useAuth } from "@/hooks/useAuth";
import { useMounted } from "@/hooks/useMounted";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  LayoutDashboard,
  Home,
  Store,
  User as UserIcon,
  LogOut,
  MapPin,
  Users,
  FolderTree,
  Shield,
  Heart,
  Scale,
  Truck,
  UserPlus,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user: authUser, isAuthenticated, role, isAdmin, isManager, logout: authLogout } = useAuth();

  const cartItemCount = useSelector(selectCartTotalCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const comparisonCount = useSelector(selectComparisonCount);
  const isMobileMenuOpen = useSelector(selectMobileMenuOpen);

  const [triggerGetProfile] = useLazyGetUserProfileQuery();
  const [searchInput, setSearchInput] = useState("");
  const mounted = useMounted();
  const hasAttemptedProfileFetch = useRef(false);

  // Fetch profile on mount once if real token exists but user profile is missing
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("nexacart_access_token") : null;
    const isDemoToken = Boolean(token?.startsWith("demo_"));

    if (mounted && isAuthenticated && !authUser && !isDemoToken && !hasAttemptedProfileFetch.current) {
      hasAttemptedProfileFetch.current = true;
      triggerGetProfile()
        .unwrap()
        .then((res) => {
          dispatch(setUserProfile(res));
        })
        .catch(() => {
          // Real token expired or invalid: cleanly clear to stop loop
          dispatch(logout());
        });
    }
  }, [mounted, isAuthenticated, authUser, triggerGetProfile, dispatch]);

  // Completely hide customer header on Admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput("");
      dispatch(setMobileMenuOpen(false));
    }
  };

  const allNavLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/products", icon: Store },
    { label: "Locations", href: "/locations", icon: MapPin },
    { label: "Track Order", href: "/track-order", icon: Truck },
    { label: "Admin", href: "/admin", icon: LayoutDashboard, requiresAdminOrManager: true },
  ];

  const navLinks = allNavLinks.filter((link) => {
    if (link.requiresAdminOrManager) {
      return mounted && (isAdmin || isManager);
    }
    return true;
  });

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="app-header">
        {/* Top Promotional Announcement Bar */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white text-[11px] sm:text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 tracking-wide shadow-inner">
          <span className="hidden sm:inline">🎉</span>
          <span>Special Offer: Use code <strong className="font-mono font-black tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-amber-200">NEXA20</strong> for Flat 20% OFF!</span>
          <span className="hidden md:inline text-indigo-200">• Free Express Shipping over $100</span>
        </div>

        <div className="header-container">
          <div className="header-nav-wrap">
            {/* Logo */}
            <Link href="/" className="brand-logo">
              <div className="brand-icon-box">
                <ShoppingBag style={{ width: "1.25rem", height: "1.25rem" }} />
              </div>
              <span className="brand-name">
                Nexa<span className="brand-highlight">cart</span>
              </span>
            </Link>

            {/* Desktop Search Bar (Hidden on mobile/tablet) */}
            <form onSubmit={handleSearchSubmit} className="header-search-form header-search-desktop">
              <input
                type="text"
                placeholder="Search products by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="header-search-input"
              />
              <Search className="header-search-icon" style={{ width: "1rem", height: "1rem" }} />
            </form>

            {/* Desktop Navigation Links & Profile (Hidden on mobile/tablet) */}
            <div className="header-desktop-nav">
              <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`nav-link-item ${active ? "active" : ""}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div style={{ height: "1.5rem", width: "1px", backgroundColor: "var(--color-border)" }}></div>

              {/* Compare Shortcut */}
              <Link href="/compare" className="cart-badge-btn" aria-label="Compare Products" title="Compare Products">
                <Scale style={{ width: "1.15rem", height: "1.15rem" }} />
                {mounted && comparisonCount > 0 && (
                  <span className="cart-counter" style={{ backgroundColor: "#6366f1" }}>
                    {comparisonCount}
                  </span>
                )}
              </Link>

              {/* Wishlist Shortcut */}
              <Link href="/account/wishlist" className="cart-badge-btn" aria-label="My Wishlist" title="My Wishlist">
                <Heart style={{ width: "1.15rem", height: "1.15rem" }} />
                {mounted && wishlistCount > 0 && (
                  <span className="cart-counter" style={{ backgroundColor: "#f43f5e" }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Sign In / Profile */}
              {mounted && isAuthenticated ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Link
                    href={isAdmin || isManager ? "/admin" : "/account"}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    title={isAdmin || isManager ? "Go to Admin Dashboard" : "Go to My Account"}
                  >
                    {authUser?.avatar ? (
                      <img
                        src={authUser.avatar}
                        alt={authUser.name}
                        style={{ width: "2rem", height: "2rem", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-primary)" }}
                      />
                    ) : (
                      <div className="brand-icon-box" style={{ width: "2rem", height: "2rem" }}>
                        <UserIcon style={{ width: "1rem", height: "1rem" }} />
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, lineHeight: 1.2 }}>
                        {authUser?.name || "Account"}
                      </span>
                      {(role === "Admin" || role === "Manager") && (
                        <span
                          style={{
                            fontSize: "0.625rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: role === "Admin" ? "#4f46e5" : "#9333ea",
                          }}
                        >
                          {role}
                        </span>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={authLogout}
                    className="btn btn-ghost btn-sm"
                    title="Sign Out"
                    style={{ padding: "0.375rem" }}
                  >
                    <LogOut style={{ width: "1rem", height: "1rem" }} />
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <button
                    onClick={() => dispatch(openLoginModal())}
                    className="btn btn-outline btn-sm"
                  >
                    <UserIcon style={{ width: "0.875rem", height: "0.875rem" }} /> Sign In
                  </button>
                  <button
                    onClick={() => dispatch(openRegisterModal())}
                    className="btn btn-primary btn-sm hidden sm:inline-flex"
                    style={{ fontSize: "0.75rem", padding: "0.375rem 0.625rem" }}
                  >
                    <UserPlus style={{ width: "0.875rem", height: "0.875rem" }} /> Register
                  </button>
                </div>
              )}

              {/* Cart Button */}
              <Link href="/cart" className="cart-badge-btn" aria-label="Shopping Cart">
                <ShoppingBag style={{ width: "1.25rem", height: "1.25rem" }} />
                {mounted && cartItemCount > 0 && (
                  <span className="cart-counter">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Actions: Cart & Hamburger Toggle */}
            <div className="header-mobile-actions">
              {/* Quick Wishlist on Mobile */}
              <Link href="/account/wishlist" className="cart-badge-btn" aria-label="Wishlist">
                <Heart style={{ width: "1.15rem", height: "1.15rem" }} />
                {mounted && wishlistCount > 0 && (
                  <span className="cart-counter" style={{ backgroundColor: "#f43f5e" }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Quick Cart Button */}
              <Link href="/cart" className="cart-badge-btn" aria-label="Shopping Cart">
                <ShoppingBag style={{ width: "1.25rem", height: "1.25rem" }} />
                {mounted && cartItemCount > 0 && (
                  <span className="cart-counter">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => dispatch(toggleMobileMenu())}
                className="header-mobile-toggle"
                aria-label="Toggle Mobile Menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X style={{ width: "1.25rem", height: "1.25rem" }} />
                ) : (
                  <Menu style={{ width: "1.25rem", height: "1.25rem" }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer (Only visible on mobile/tablet when open) */}
        {isMobileMenuOpen && (
          <div style={{ padding: "1rem", backgroundColor: "#ffffff", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "0.875rem", boxShadow: "var(--shadow-md)" }}>
            {/* Mobile Search Form */}
            <form onSubmit={handleSearchSubmit} className="header-search-form" style={{ maxWidth: "100%" }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="header-search-input"
              />
              <Search className="header-search-icon" style={{ width: "1rem", height: "1rem" }} />
            </form>

            {/* Mobile Navigation Links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => dispatch(setMobileMenuOpen(false))}
                    className={`nav-link-item ${active ? "active" : ""}`}
                    style={{ borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.875rem" }}
                  >
                    {IconComponent && <IconComponent style={{ width: "1.125rem", height: "1.125rem", color: active ? "var(--color-primary)" : "var(--color-text-muted)" }} />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Customer Portal Mobile Links */}
              <Link
                href="/account"
                className="nav-link-item"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                style={{ borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.875rem" }}
              >
                <UserIcon style={{ width: "1.125rem", height: "1.125rem", color: "var(--color-text-muted)" }} />
                <span>My Account Dashboard</span>
              </Link>

              <Link
                href="/account/orders"
                className="nav-link-item"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                style={{ borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.875rem" }}
              >
                <ShoppingBag style={{ width: "1.125rem", height: "1.125rem", color: "var(--color-text-muted)" }} />
                <span>Order History</span>
              </Link>

              <Link
                href="/account/wishlist"
                className="nav-link-item"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                style={{ borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.875rem" }}
              >
                <Heart style={{ width: "1.125rem", height: "1.125rem", color: "var(--color-text-muted)" }} />
                <span>My Wishlist ({mounted ? wishlistCount : 0})</span>
              </Link>

              <Link
                href="/compare"
                className="nav-link-item"
                onClick={() => dispatch(setMobileMenuOpen(false))}
                style={{ borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.875rem" }}
              >
                <Scale style={{ width: "1.125rem", height: "1.125rem", color: "var(--color-text-muted)" }} />
                <span>Compare Products ({mounted ? comparisonCount : 0})</span>
              </Link>

              {mounted && isAdmin && (
                <Link
                  href="/admin/users"
                  className="nav-link-item"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                  style={{ borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.875rem" }}
                >
                  <Users style={{ width: "1.125rem", height: "1.125rem", color: "var(--color-text-muted)" }} />
                  <span>Manage Users</span>
                </Link>
              )}
              {mounted && (isAdmin || isManager) && (
                <Link
                  href="/admin/categories"
                  className="nav-link-item"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                  style={{ borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.875rem" }}
                >
                  <FolderTree style={{ width: "1.125rem", height: "1.125rem", color: "var(--color-text-muted)" }} />
                  <span>Manage Categories</span>
                </Link>
              )}
            </nav>

            {/* Mobile User Profile / Sign In Section */}
            <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--color-border)" }}>
              {mounted && isAuthenticated ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    {authUser?.avatar ? (
                      <img
                        src={authUser.avatar}
                        alt={authUser.name}
                        style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-primary)" }}
                      />
                    ) : (
                      <div className="brand-icon-box" style={{ width: "2.25rem", height: "2.25rem" }}>
                        <UserIcon style={{ width: "1.125rem", height: "1.125rem" }} />
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-text-main)" }}>
                        {authUser?.name || "Member"}
                      </span>
                      {(role === "Admin" || role === "Manager") && (
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: role === "Admin" ? "#4f46e5" : "#9333ea",
                          }}
                        >
                          {role}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      authLogout();
                      dispatch(setMobileMenuOpen(false));
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: "0.75rem", color: "#e11d48", borderColor: "#fecdd3" }}
                  >
                    <LogOut style={{ width: "0.875rem", height: "0.875rem" }} /> Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <button
                    onClick={() => {
                      dispatch(openLoginModal());
                      dispatch(setMobileMenuOpen(false));
                    }}
                    className="btn btn-outline btn-full btn-sm"
                    style={{ fontWeight: 700 }}
                  >
                    <UserIcon style={{ width: "0.875rem", height: "0.875rem" }} /> Sign In
                  </button>
                  <button
                    onClick={() => {
                      dispatch(openRegisterModal());
                      dispatch(setMobileMenuOpen(false));
                    }}
                    className="btn btn-primary btn-full btn-sm"
                    style={{ fontWeight: 700 }}
                  >
                    <UserPlus style={{ width: "0.875rem", height: "0.875rem" }} /> Create Account (Register)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
    </header>
  );
}
