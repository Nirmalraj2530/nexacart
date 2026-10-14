"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart } from "lucide-react";
import {
  addToWishlist,
  removeFromWishlist,
  selectIsInWishlist,
} from "@/redux/slices/wishlistSlice";
import { addToast } from "@/redux/slices/uiSlice";
import { useAuth } from "@/hooks/useAuth";

/**
 * Reusable heart toggle button for wishlist.
 * Requires the full product object.
 */
export function WishlistButton({ product, size = "sm", className = "" }) {
  const dispatch = useDispatch();
  const { isAuthenticated, openLogin } = useAuth();
  const isWishlisted = useSelector(selectIsInWishlist(product?.id));

  if (!product) return null;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      dispatch(addToast({ message: "Please sign in to save items to your wishlist", type: "warning" }));
      openLogin();
      return;
    }

    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
      dispatch(addToast({ message: `"${product.title}" removed from wishlist`, type: "info" }));
    } else {
      dispatch(addToWishlist(product));
      dispatch(addToast({ message: `"${product.title}" added to wishlist!`, type: "success" }));
    }
  };

  const iconSize = size === "sm" ? "0.875rem" : size === "lg" ? "1.25rem" : "1rem";

  return (
    <button
      onClick={handleToggle}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      style={{
        background: isWishlisted ? "#ffe4e6" : "#f8fafc",
        border: `1.5px solid ${isWishlisted ? "#fda4af" : "#e2e8f0"}`,
        borderRadius: "50%",
        width: size === "sm" ? "2rem" : size === "lg" ? "2.5rem" : "2.25rem",
        height: size === "sm" ? "2rem" : size === "lg" ? "2.5rem" : "2.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
      className={className}
      onMouseEnter={(e) => {
        if (!isWishlisted) {
          e.currentTarget.style.background = "#fff1f2";
          e.currentTarget.style.borderColor = "#fda4af";
        }
      }}
      onMouseLeave={(e) => {
        if (!isWishlisted) {
          e.currentTarget.style.background = "#f8fafc";
          e.currentTarget.style.borderColor = "#e2e8f0";
        }
      }}
    >
      <Heart
        style={{
          width: iconSize,
          height: iconSize,
          fill: isWishlisted ? "#e11d48" : "none",
          color: isWishlisted ? "#e11d48" : "#94a3b8",
          transition: "all 0.2s ease",
        }}
      />
    </button>
  );
}
