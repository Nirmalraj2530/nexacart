"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setPendingCartItem } from "@/redux/slices/cartSlice";
import {
  addToComparison,
  removeFromComparison,
  selectIsInComparison,
} from "@/redux/slices/comparisonSlice";
import { addToast } from "@/redux/slices/uiSlice";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, cleanImageUrl, getCategoryCuratedImage } from "@/utils/formatters";
import { ShoppingBag, Eye, Star, Scale } from "lucide-react";
import { Button } from "@/components/common/Button";
import { WishlistButton } from "@/components/product/WishlistButton";
import { QuickViewModal } from "@/components/product/QuickViewModal";

export function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { isAuthenticated, openLogin } = useAuth();
  const isInComparison = useSelector(selectIsInComparison(product?.id));
  const categoryName = product?.category?.name || "General";
  const [imgSrc, setImgSrc] = useState(() =>
    cleanImageUrl(product?.images || product?.image, null, categoryName || product?.title)
  );
  const [imgError, setImgError] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  if (!product) return null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Flipkart-style: Require login before adding items to cart
    if (!isAuthenticated) {
      dispatch(setPendingCartItem({ product, quantity: 1 }));
      dispatch(
        addToast({
          message: "Please sign in to add items to your cart",
          type: "warning",
        })
      );
      openLogin();
      return;
    }

    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(
      addToast({
        message: `Added "${product.title}" to cart!`,
        type: "success",
      })
    );
  };

  const displayImage = imgError
    ? getCategoryCuratedImage(categoryName, product?.id || product?.title)
    : imgSrc;

  return (
    <>
      <div className="product-card" style={{ position: "relative" }}>
        {/* Wishlist + Quick View overlay buttons */}
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
            opacity: 0,
            transition: "opacity 0.2s ease",
          }}
          className="product-card-actions"
        >
          <WishlistButton product={product} size="sm" />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isInComparison) {
                dispatch(removeFromComparison(product.id));
                dispatch(addToast({ message: `Removed "${product.title}" from comparison`, type: "info" }));
              } else {
                dispatch(addToComparison(product));
                dispatch(addToast({ message: `Added "${product.title}" to comparison`, type: "success" }));
              }
            }}
            aria-label="Compare product"
            title={isInComparison ? "Remove from comparison" : "Compare product (max 4)"}
            style={{
              background: isInComparison ? "#4f46e5" : "#f8fafc",
              border: "1.5px solid " + (isInComparison ? "#4f46e5" : "#e2e8f0"),
              borderRadius: "50%",
              width: "2rem",
              height: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Scale style={{ width: "0.875rem", height: "0.875rem", color: isInComparison ? "#ffffff" : "#64748b" }} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
            aria-label="Quick view"
            title="Quick View"
            style={{
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "50%",
              width: "2rem",
              height: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Eye style={{ width: "0.875rem", height: "0.875rem", color: "#64748b" }} />
          </button>
        </div>

        <div className="product-card-img-wrap">
          <img
            src={displayImage}
            alt={product.title}
            onError={() => setImgError(true)}
            className="product-card-img"
            loading="lazy"
          />

          <span className="product-category-tag">
            {categoryName}
          </span>
        </div>

        <div className="product-card-content">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#fbbf24", fontSize: "0.75rem" }}>
              <Star style={{ width: "0.875rem", height: "0.875rem", fill: "#fbbf24" }} />
              <Star style={{ width: "0.875rem", height: "0.875rem", fill: "#fbbf24" }} />
              <Star style={{ width: "0.875rem", height: "0.875rem", fill: "#fbbf24" }} />
              <Star style={{ width: "0.875rem", height: "0.875rem", fill: "#fbbf24" }} />
              <Star style={{ width: "0.875rem", height: "0.875rem", fill: "#e2e8f0" }} />
              <span style={{ color: "#94a3b8", marginLeft: "0.25rem" }}>(4.8)</span>
            </div>

            <Link href={`/products/${product.id}`} className="product-card-title">
              {product.title}
            </Link>
          </div>

          <div className="product-card-footer">
            <div>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block" }}>Price</span>
              <span className="product-price-amount">
                {formatCurrency(product.price)}
              </span>
            </div>

            <Button
              size="sm"
              variant="primary"
              icon={ShoppingBag}
              onClick={handleAddToCart}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {showQuickView && (
        <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />
      )}
    </>
  );
}
