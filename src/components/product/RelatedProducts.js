"use client";

import React from "react";
import { useGetRelatedProductsQuery, useGetProductsQuery } from "@/redux/services/productApi";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "@/components/common/Skeleton";

export function RelatedProducts({ productId, categoryId }) {
  const {
    data: apiRelated,
    isLoading: isRelatedLoading,
    isError: isRelatedError,
  } = useGetRelatedProductsQuery(productId, { skip: !productId });

  const { data: allProducts } = useGetProductsQuery(
    categoryId ? { categoryId } : undefined,
    { skip: !categoryId || (apiRelated && apiRelated.length > 0) }
  );

  if (isRelatedLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Determine final list of related items safely
  let items = Array.isArray(apiRelated) && apiRelated.length > 0 ? apiRelated : [];

  if (items.length === 0 && Array.isArray(allProducts)) {
    items = allProducts.filter((p) => p && p.id && String(p.id) !== String(productId));
  }

  // Filter out invalid items or self product
  items = items
    .filter((p) => p && p.id && String(p.id) !== String(productId))
    .slice(0, 4);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 pt-12 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Related Products
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            You might also like these items from the same collection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}
