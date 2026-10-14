import Link from "next/link";
import { ShoppingBag, Home, Store, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="header-container" style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
      <div style={{ maxWidth: "560px", width: "100%", textAlign: "center", backgroundColor: "var(--color-surface, #ffffff)", borderRadius: "var(--radius-2xl, 1.5rem)", border: "1px solid var(--color-border, #e2e8f0)", padding: "3rem 2rem", boxShadow: "var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))" }}>
        
        {/* 404 Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.875rem", borderRadius: "9999px", backgroundColor: "var(--color-primary-light, #e0e7ff)", color: "var(--color-primary, #4f46e5)", fontSize: "0.875rem", fontWeight: 800, marginBottom: "1.25rem" }}>
          <ShoppingBag style={{ width: "1rem", height: "1rem" }} /> Error 404
        </div>

        {/* Large Title */}
        <h1 style={{ fontSize: "3rem", fontWeight: 900, color: "var(--color-text-main, #0f172a)", margin: "0 0 0.5rem", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          Page Not Found
        </h1>

        <p style={{ fontSize: "1rem", color: "var(--color-text-muted, #64748b)", margin: "0 auto 2rem", maxWidth: "26rem", lineHeight: 1.6 }}>
          The page or product you are looking for doesn't exist, has been moved, or the URL might be mistyped.
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginBottom: "2rem" }}>
          <Link href="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "0.75rem", fontWeight: 700 }}>
            <Home style={{ width: "1rem", height: "1rem" }} /> Back to Home
          </Link>
          <Link href="/products" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "0.75rem", fontWeight: 700 }}>
            <Store style={{ width: "1rem", height: "1rem" }} /> Browse Products
          </Link>
        </div>

        {/* Quick Links */}
        <div style={{ paddingTop: "1.5rem", borderTop: "1px solid var(--color-border, #e2e8f0)", fontSize: "0.875rem", color: "var(--color-text-light, #94a3b8)" }}>
          <span>Looking for admin management? </span>
          <Link href="/admin" style={{ color: "var(--color-primary, #4f46e5)", fontWeight: 700, textDecoration: "underline" }}>
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
