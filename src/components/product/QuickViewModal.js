"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { X, ShoppingBag, Heart, Star, Truck, ShieldCheck, Plus, Minus } from "lucide-react";
import { addToCart, setPendingCartItem } from "@/redux/slices/cartSlice";
import { addToast } from "@/redux/slices/uiSlice";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, cleanImageUrl } from "@/utils/formatters";
import { Button } from "@/components/common/Button";
import { WishlistButton } from "@/components/product/WishlistButton";
import Link from "next/link";

/**
 * Quick View modal for a product.
 * Displayed inline without navigating to the product detail page.
 */
export function QuickViewModal({ product, onClose }) {
  const dispatch = useDispatch();
  const { isAuthenticated, openLogin } = useAuth();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const categoryName = product.category?.name || "General";
  const imageUrl = cleanImageUrl(product.images || product.image, null, categoryName);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      dispatch(setPendingCartItem({ product, quantity }));
      dispatch(addToast({ message: "Please sign in to add items to your cart", type: "warning" }));
      openLogin();
      onClose();
      return;
    }
    dispatch(addToCart({ product, quantity }));
    dispatch(addToast({ message: `Added "${product.title}" to cart!`, type: "success" }));
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        backgroundColor: "rgba(15,23,42,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          borderRadius: "1.5rem",
          boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          width: "100%",
          maxWidth: "52rem",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
          animation: "fadeIn 0.2s ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            zIndex: 10,
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: "2rem",
            height: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
          }}
          aria-label="Close quick view"
        >
          <X style={{ width: "1rem", height: "1rem" }} />
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", padding: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
            {/* Image */}
            <div
              style={{
                aspectRatio: "1",
                borderRadius: "1rem",
                overflow: "hidden",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <img src={imageUrl} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#4f46e5" }}>
                {categoryName}
              </span>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3, margin: 0 }}>
                {product.title}
              </h2>

              {/* Stars */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} style={{ width: "0.875rem", height: "0.875rem", fill: "#fbbf24", color: "#fbbf24" }} />
                ))}
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginLeft: "0.25rem" }}>· 24 reviews</span>
              </div>

              <div>
                <span style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a" }}>
                  {formatCurrency(product.price)}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginTop: "0.125rem" }}>
                  In Stock · Free shipping on orders over $100
                </span>
              </div>

              <p style={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                {product.description?.slice(0, 180)}{product.description?.length > 180 ? "..." : ""}
              </p>

              {/* Quantity */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>Qty:</span>
                <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "0.75rem", overflow: "hidden" }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: "0.5rem", border: "none", background: "transparent", cursor: "pointer", color: "#64748b" }}>
                    <Minus style={{ width: "0.875rem", height: "0.875rem" }} />
                  </button>
                  <span style={{ padding: "0.25rem 0.75rem", fontWeight: 700, color: "#0f172a", minWidth: "2rem", textAlign: "center" }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} style={{ padding: "0.5rem", border: "none", background: "transparent", cursor: "pointer", color: "#64748b" }}>
                    <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
                  </button>
                </div>
                <WishlistButton product={product} size="md" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <Button variant="primary" size="lg" icon={ShoppingBag} fullWidth onClick={handleAddToCart} className="font-bold">
                  Add to Cart
                </Button>
                <Link href={`/products/${product.id}`} onClick={onClose} style={{ textAlign: "center", fontSize: "0.8125rem", color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>
                  View Full Details →
                </Link>
              </div>

              {/* Mini perks */}
              <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#64748b", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Truck style={{ width: "0.875rem", height: "0.875rem", color: "#4f46e5" }} /> Fast Delivery
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <ShieldCheck style={{ width: "0.875rem", height: "0.875rem", color: "#059669" }} /> Genuine Product
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
