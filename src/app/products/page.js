"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetProductsQuery, useGetCategoriesQuery } from "@/redux/services/productApi";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort";
import { ProductPagination } from "@/components/product/ProductPagination";
import { ProductSearch } from "@/components/product/ProductSearch";
import { ProductCardSkeleton } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { useDebounce } from "@/hooks/useDebounce";
import { useApiSimulation } from "@/hooks/useApiSimulation";
import { Filter, X, Tag } from "lucide-react";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { forceApiError, forceEmptyData, simulatedDelay, useLargeDataset } = useApiSimulation();

  // URL state params
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 300);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // RTK Query fetches products and categories
  const { data: rawProducts = [], isLoading, isError, error, refetch } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  // Simulated dataset handling
  const productsToFilter = useMemo(() => {
    if (forceEmptyData) return [];
    if (!useLargeDataset) return rawProducts;

    const dataset = [];
    for (let i = 0; i < 10; i++) {
      rawProducts.forEach((p, idx) => {
        dataset.push({
          ...p,
          id: `${p.id}_gen_${i}_${idx}`,
          title: `${p.title} (Batch #${i + 1})`,
        });
      });
    }
    return dataset;
  }, [rawProducts, useLargeDataset, forceEmptyData]);

  // Client-side filtering and sorting for maximum responsiveness
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...productsToFilter];

    // Filter by Category
    if (selectedCategory) {
      result = result.filter((p) => String(p.category?.id) === String(selectedCategory));
    }

    // Filter by Search Title (Debounced for performance)
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q)
      );
    }

    // Filter by Price Min / Max
    if (minPrice !== "" && !isNaN(Number(minPrice))) {
      result = result.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice !== "" && !isNaN(Number(maxPrice))) {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    // Sorting
    switch (sortOption) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name_desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "latest":
      default:
        result.sort((a, b) => String(b.id).localeCompare(String(a.id)));
        break;
    }

    return result;
  }, [productsToFilter, selectedCategory, debouncedSearch, minPrice, maxPrice, sortOption]);

  // Pagination calculation
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPaginatedProducts = filteredAndSortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePriceChange = (type, val) => {
    setCurrentPage(1);
    if (type === "min") setMinPrice(val);
    if (type === "max") setMaxPrice(val);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortOption("latest");
    setCurrentPage(1);
    router.push("/products");
  };

  const effectiveLoading = isLoading || simulatedDelay > 0;
  const effectiveError = isError || forceApiError;

  return (
    <div className="header-container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
      {/* Header Title Section */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 900, margin: 0 }}>
            Product Catalog
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", margin: "0.25rem 0 0" }}>
            Browse our entire collection of items ({totalItems} total items found)
          </p>
        </div>
        <div style={{ width: "100%", maxWidth: "320px" }}>
          <ProductSearch
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters((prev) => !prev)}
          className="btn btn-outline btn-full flex items-center justify-between py-2.5 px-4 rounded-xl border border-slate-200"
          aria-expanded={showMobileFilters}
        >
          <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Filter className="w-4 h-4 text-indigo-600" />
            {selectedCategory || minPrice || maxPrice ? "Active Filters Applied" : "Filter Products"}
          </span>
          <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg">
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </span>
        </button>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className={`lg:col-span-1 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
          <ProductFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(catId) => {
              setSelectedCategory(catId);
              setCurrentPage(1);
            }}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceChange}
            onReset={handleResetFilters}
          />
        </aside>

        {/* Product Grid & Controls */}
        <main className="lg:col-span-3 min-w-0">
          {/* Active Filter Chips */}
          {(selectedCategory || debouncedSearch || minPrice || maxPrice) && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                Active Filters:
              </span>

              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Tag className="w-3 h-3 text-indigo-500" />
                  {categories.find((c) => String(c.id) === String(selectedCategory))?.name || "Category"}
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setCurrentPage(1);
                    }}
                    className="hover:text-rose-600 transition-colors ml-0.5"
                    aria-label="Remove category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {debouncedSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  "{debouncedSearch}"
                  <button
                    onClick={() => {
                      setSearch("");
                      setCurrentPage(1);
                    }}
                    className="hover:text-rose-600 transition-colors ml-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  ${minPrice || 0} – ${maxPrice || "Any"}
                  <button
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                      setCurrentPage(1);
                    }}
                    className="hover:text-rose-600 transition-colors ml-0.5"
                    aria-label="Reset price filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 ml-auto hover:underline"
              >
                Clear All
              </button>
            </div>
          )}

          <ProductSort
            currentSort={sortOption}
            onSortChange={setSortOption}
            totalItems={totalItems}
          />

          {effectiveLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : effectiveError ? (
            <ErrorState
              title="Unable to Load Products (500 API Error)"
              message="Simulated API failure or network connection drop. Click retry to reload."
              onRetry={refetch}
            />
          ) : currentPaginatedProducts.length === 0 ? (
            <EmptyState
              title="No Matching Products Found"
              description="Try clearing your search terms or expanding your price range filters."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <ProductGrid products={currentPaginatedProducts} />
              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="header-container" style={{ paddingTop: "3rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
