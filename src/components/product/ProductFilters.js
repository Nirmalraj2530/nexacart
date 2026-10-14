"use client";

import React from "react";
import { Filter, RotateCcw } from "lucide-react";

export function ProductFilters({
  categories = [],
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  onReset,
}) {
  return (
    <div className="filter-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-border)" }}>
        <h3 style={{ fontSize: "var(--font-size-xs)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-main)", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
          <Filter style={{ width: "1rem", height: "1rem", color: "var(--color-primary)" }} />
          Filters
        </h3>
        {(selectedCategory || minPrice || maxPrice) && (
          <button
            onClick={onReset}
            style={{ fontSize: "var(--font-size-xs)", color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 600 }}
          >
            <RotateCcw style={{ width: "0.75rem", height: "0.75rem" }} /> Reset
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label className="form-label">Categories</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "15rem", overflowY: "auto" }}>
          <button
            onClick={() => onCategoryChange("")}
            className={`filter-category-btn ${!selectedCategory ? "active" : ""}`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = String(selectedCategory) === String(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(isSelected ? "" : cat.id)}
                className={`filter-category-btn ${isSelected ? "active" : ""}`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", pt: "0.75rem", borderTop: "1px solid var(--color-border)" }}>
        <label className="form-label">Price Range ($)</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div>
            <span style={{ fontSize: "0.6875rem", color: "var(--color-text-light)", display: "block", marginBottom: "0.25rem" }}>Min Price</span>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={minPrice}
              onChange={(e) => onPriceChange("min", e.target.value)}
              className="input-field"
              style={{ padding: "0.375rem 0.625rem", fontSize: "var(--font-size-xs)" }}
            />
          </div>
          <div>
            <span style={{ fontSize: "0.6875rem", color: "var(--color-text-light)", display: "block", marginBottom: "0.25rem" }}>Max Price</span>
            <input
              type="number"
              placeholder="1000"
              min="0"
              value={maxPrice}
              onChange={(e) => onPriceChange("max", e.target.value)}
              className="input-field"
              style={{ padding: "0.375rem 0.625rem", fontSize: "var(--font-size-xs)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
