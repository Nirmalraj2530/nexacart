"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
} from "@/redux/services/productApi";
import { useDispatch } from "react-redux";
import { addToast } from "@/redux/slices/uiSlice";
import { formatCurrency, cleanImageUrl, exportProductsToCSV } from "@/utils/formatters";
import { TableSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { Button } from "@/components/common/Button";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/hooks/useAuth";
import { useApiSimulation } from "@/hooks/useApiSimulation";
import { Plus, Eye, Edit, Trash2, Search, ArrowLeft, Copy, Shield, Download, Lock } from "lucide-react";

export default function AdminProductsPage() {
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const { forceApiError, forceEmptyData, simulatedDelay, useLargeDataset } = useApiSimulation();

  const { data: rawProducts = [], isLoading, isError, error, refetch } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [createProduct, { isLoading: isDuplicating }] = useCreateProductMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [productToDelete, setProductToDelete] = useState(null);

  // Large dataset mock simulation for trainer test suite
  const products = useMemo(() => {
    if (forceEmptyData) return [];
    if (!useLargeDataset) return rawProducts;

    // Multiply dataset to 100+ items to demonstrate large dataset performance
    const largeList = [];
    for (let i = 0; i < 10; i++) {
      rawProducts.forEach((p, idx) => {
        largeList.push({
          ...p,
          id: `${p.id}_gen_${i}_${idx}`,
          title: `${p.title} (Batch #${i + 1})`,
        });
      });
    }
    return largeList;
  }, [rawProducts, useLargeDataset, forceEmptyData]);

  // Debounced search filtering
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return products;
    return products.filter(
      (p) =>
        p.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  // Duplicate Product Action
  const handleDuplicateProduct = async (product) => {
    try {
      const duplicatePayload = {
        title: `[Copy] ${product.title}`,
        price: product.price,
        description: product.description || "Duplicated item entry.",
        categoryId: product.category?.id || 1,
        images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [cleanImageUrl(product.image)],
      };

      await createProduct(duplicatePayload).unwrap();
      dispatch(
        addToast({
          message: `Duplicated product successfully as "${duplicatePayload.title}"!`,
          type: "success",
        })
      );
      refetch();
    } catch (err) {
      dispatch(
        addToast({
          message: err?.data?.message || "Failed to duplicate product.",
          type: "error",
        })
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    if (!isAdmin) {
      dispatch(addToast({ message: "Unauthorized: Only Admins can delete products.", type: "error" }));
      return;
    }
    try {
      await deleteProduct(productToDelete.id).unwrap();
      dispatch(
        addToast({
          message: `Product "${productToDelete.title}" deleted successfully.`,
          type: "success",
        })
      );
      setProductToDelete(null);
    } catch (err) {
      dispatch(
        addToast({
          message: err?.data?.message || "Failed to delete product.",
          type: "error",
        })
      );
    }
  };

  const effectiveLoading = isLoading || simulatedDelay > 0;
  const effectiveError = isError || forceApiError;

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <div>
        <Link
          href="/admin"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "1rem" }}
        >
          <ArrowLeft style={{ width: "1rem", height: "1rem" }} /> Back to Dashboard
        </Link>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 1.875rem)", fontWeight: 900, margin: 0 }}>
              Manage Products
            </h1>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", margin: "0.25rem 0 0" }}>
              Add, edit, duplicate, or delete catalog products ({filteredProducts.length} total items)
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Button
              variant="outline"
              icon={Download}
              onClick={() => {
                exportProductsToCSV(filteredProducts, "nexacart_admin_products.csv");
                dispatch(addToast({ message: `Exported ${filteredProducts.length} products to CSV!`, type: "success" }));
              }}
            >
              Export CSV
            </Button>
            <Link href="/admin/products/create">
              <Button variant="primary" icon={Plus}>
                Create New Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", maxWidth: "420px", width: "100%" }}>
          <input
            type="text"
            placeholder="Debounced search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "2.5rem" }}
          />
          <Search style={{ width: "1rem", height: "1rem", color: "var(--color-text-light)", position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>

        {useLargeDataset && (
          <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.375rem 0.75rem", borderRadius: "var(--radius-full)", backgroundColor: "#d1fae5", color: "#065f46" }}>
            ⚡ Large Dataset Simulation Active ({products.length} items)
          </span>
        )}
      </div>

      {/* Table / Error / Loading States */}
      {effectiveLoading ? (
        <TableSkeleton rows={8} />
      ) : effectiveError ? (
        <ErrorState
          title="Failed to Load Products (API Error 500)"
          message="Simulated API failure or network issue. Click retry to recover."
          onRetry={refetch}
        />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description={debouncedSearch ? "No items match your debounced search query." : "Your product inventory is currently empty."}
          actionText="Create Product"
          actionHref="/admin/products/create"
        />
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={cleanImageUrl(product.images || product.image, null, product.category?.name || product.title)}
                        alt=""
                        className="table-img"
                      />
                    </td>
                    <td>
                      <strong style={{ color: "var(--color-text-main)", display: "block" }}>{product.title}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-light)" }}>ID: #{product.id}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.625rem", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-bg)", color: "var(--color-text-main)" }}>
                        {product.category?.name || "General"}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--color-text-main)" }}>{formatCurrency(product.price)}</strong>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.375rem" }}>
                        <Link href={`/products/${product.id}`}>
                          <button className="btn btn-ghost btn-sm" title="View Product">
                            <Eye style={{ width: "1rem", height: "1rem" }} />
                          </button>
                        </Link>
                        <Link href={`/admin/products/edit/${product.id}`}>
                          <button className="btn btn-ghost btn-sm" title="Edit Product">
                            <Edit style={{ width: "1rem", height: "1rem" }} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDuplicateProduct(product)}
                          disabled={isDuplicating}
                          className="btn btn-ghost btn-sm"
                          style={{ color: "var(--color-primary)" }}
                          title="Duplicate Product (Clone)"
                        >
                          <Copy style={{ width: "1rem", height: "1rem" }} />
                        </button>
                        {isAdmin ? (
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: "var(--color-danger)" }}
                            title="Delete Product"
                          >
                            <Trash2 style={{ width: "1rem", height: "1rem" }} />
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-light)", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }} title="Deletion is restricted to Admin role">
                            <Lock style={{ width: "0.75rem", height: "0.75rem" }} /> Admin Only
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
        productTitle={productToDelete?.title}
        isLoading={isDeleting}
      />
    </div>
  );
}
