"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/services/productApi";
import { useDispatch } from "react-redux";
import { addToast } from "@/redux/slices/uiSlice";
import { cleanImageUrl } from "@/utils/formatters";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { ImageUpload } from "@/components/common/ImageUpload";
import { TableSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, ArrowLeft, FolderTree, Tag, Lock } from "lucide-react";

export default function AdminCategoriesPage() {
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const { data: categories = [], isLoading, isError, error, refetch } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");

  const handleOpenCreate = () => {
    setEditCategory(null);
    setCategoryName("");
    setCategoryImage("https://picsum.photos/600/600");
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditCategory(cat);
    setCategoryName(cat.name);
    setCategoryImage(cat.image || "https://picsum.photos/600/600");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (editCategory) {
        await updateCategory({
          id: editCategory.id,
          name: categoryName.trim(),
          image: categoryImage,
        }).unwrap();
        dispatch(addToast({ message: `Updated category "${categoryName}"`, type: "success" }));
      } else {
        await createCategory({
          name: categoryName.trim(),
          image: categoryImage,
        }).unwrap();
        dispatch(addToast({ message: `Created category "${categoryName}"`, type: "success" }));
      }
      setModalOpen(false);
    } catch (err) {
      dispatch(addToast({ message: err?.data?.message || "Operation failed", type: "error" }));
    }
  };

  const handleDelete = async (id, name) => {
    if (!isAdmin) {
      dispatch(addToast({ message: "Unauthorized: Only Admins can delete categories.", type: "error" }));
      return;
    }
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await deleteCategory(id).unwrap();
      dispatch(addToast({ message: `Deleted category "${name}"`, type: "info" }));
    } catch (err) {
      dispatch(addToast({ message: err?.data?.message || "Failed to delete category", type: "error" }));
    }
  };

  return (
    <div className="admin-page-container">
      <Link href="/admin" className="btn btn-ghost btn-sm" style={{ marginBottom: "1rem" }}>
        <ArrowLeft style={{ width: "1rem", height: "1rem" }} /> Back to Dashboard
      </Link>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 1.875rem)", fontWeight: 900, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FolderTree style={{ color: "var(--color-primary)" }} /> Category Management
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", margin: "0.25rem 0 0" }}>
            View, create, edit, and organize product categories.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <ErrorState title="Failed to load categories" message={error?.data?.message} onRetry={refetch} />
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Category Name</th>
                <th>Category ID</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <img src={cleanImageUrl(cat.image)} alt="" className="table-img" />
                  </td>
                  <td>
                    <strong style={{ color: "var(--color-text-main)" }}>{cat.name}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-light)" }}>#{cat.id}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <Link href={`/products?category=${cat.id}`}>
                        <button className="btn btn-ghost btn-sm" title="View Products in Category">
                          <Tag style={{ width: "1rem", height: "1rem" }} />
                        </button>
                      </Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(cat)} title="Edit Category">
                        <Edit style={{ width: "1rem", height: "1rem" }} />
                      </button>
                      {isAdmin ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(cat.id, cat.name)} title="Delete Category" style={{ color: "var(--color-danger)" }}>
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

      {/* Modal for Create / Edit Category */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCategory ? "Edit Category" : "Create Category"}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input
            label="Category Name"
            placeholder="e.g. Electronics, Clothing"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />

          <ImageUpload
            label="Category Image"
            value={categoryImage}
            onChange={setCategoryImage}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", paddingTop: "0.5rem" }}>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreating || isUpdating}>
              {editCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
