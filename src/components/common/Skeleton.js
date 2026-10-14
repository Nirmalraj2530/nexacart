"use client";

import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton-pulse" style={{ height: "380px" }}>
      <div className="skeleton-pulse" style={{ height: "220px", width: "100%" }}></div>
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div className="skeleton-pulse" style={{ height: "0.75rem", width: "30%" }}></div>
        <div className="skeleton-pulse" style={{ height: "1.25rem", width: "80%" }}></div>
        <div className="skeleton-pulse" style={{ height: "1rem", width: "100%" }}></div>
      </div>
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="skeleton-pulse" style={{ height: "400px", borderRadius: "1.5rem" }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="skeleton-pulse" style={{ height: "1rem", width: "25%" }}></div>
          <div className="skeleton-pulse" style={{ height: "2rem", width: "75%" }}></div>
          <div className="skeleton-pulse" style={{ height: "1.75rem", width: "35%" }}></div>
          <div className="skeleton-pulse" style={{ height: "100px", width: "100%" }}></div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="admin-table-card">
      <div className="skeleton-pulse" style={{ height: "3rem", width: "100%" }}></div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton-pulse"
          style={{ height: "4rem", width: "100%", margin: "0.25rem 0" }}
        ></div>
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return <div className="skeleton-pulse" style={{ height: "10rem", borderRadius: "1.5rem" }}></div>;
}
