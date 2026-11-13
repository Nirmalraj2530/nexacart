"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
} from "@/redux/services/productApi";
import { addToast } from "@/redux/slices/uiSlice";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Save, ArrowLeft, Plus, FolderPlus } from "lucide-react";
import Link from "next/link";

export function ProductForm({ initialValues, onSubmit, isLoading, isEdit = false }) {
  const dispatch = useDispatch();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      price: "",
      description: "",
      categoryId: "",
    },
  });

  const defaultImg =
    Array.isArray(initialValues?.images) && initialValues.images.length > 0
      ? initialValues.images[0]
      : typeof initialValues?.images === "string"
      ? initialValues.images
      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

  const [imageUrl, setImageUrl] = useState(defaultImg);

  // Quick Inline Category Creation State
  const [showQuickCat, setShowQuickCat] = useState(false);
  const [quickCatName, setQuickCatName] = useState("");
  const [quickCatImage, setQuickCatImage] = useState(
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
  );

  useEffect(() => {
    if (initialValues) {
      setValue("title", initialValues.title || "");
      setValue("price", initialValues.price || "");
      setValue("description", initialValues.description || "");
      setValue(
        "categoryId",
        String(initialValues.category?.id || initialValues.categoryId || "")
      );
      if (Array.isArray(initialValues.images) && initialValues.images.length > 0) {
        setImageUrl(initialValues.images[0]);
      } else if (typeof initialValues.images === "string" && initialValues.images) {
        setImageUrl(initialValues.images);
      }
    }
  }, [initialValues, setValue]);

  const handleQuickCreateCategory = async () => {
    if (!quickCatName.trim()) {
      dispatch(addToast({ message: "Please enter a category name.", type: "warning" }));
      return;
    }

    try {
      const created = await createCategory({
        name: quickCatName.trim(),
        image: quickCatImage.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      }).unwrap();

      setValue("categoryId", String(created.id), { shouldValidate: true });
      dispatch(addToast({ message: `Category "${created.name}" created & selected!`, type: "success" }));
      setQuickCatName("");
      setShowQuickCat(false);
    } catch (err) {
      dispatch(
        addToast({
          message: err?.data?.message || "Failed to create category.",
          type: "error",
        })
      );
    }
  };

  const onFormSubmit = (data) => {
    const formattedData = {
      title: data.title,
      price: Number(data.price),
      description: data.description,
      categoryId: data.categoryId || (categories[0] ? String(categories[0].id) : ""),
      images: [
        imageUrl ||
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      ],
    };
    onSubmit(formattedData);
  };

  const categoryOptions = categories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="summary-card"
      style={{ padding: "clamp(1rem, 3vw, 2rem)" }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: "1rem",
          gap: "0.75rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, margin: 0 }}>
            {isEdit ? "Edit Product Details" : "Create New Product"}
          </h2>
          <p
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-muted)",
              margin: "0.25rem 0 0",
            }}
          >
            Fill out product metadata, pricing, category, and upload media assets.
          </p>
        </div>
        <Link href="/admin/products">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Cancel
          </Button>
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1.25rem" }}>
        <Input
          label="Product Title"
          placeholder="e.g. Premium Wireless Headphones"
          {...register("title", { required: "Title is required" })}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <Input
            label="Price ($ USD)"
            type="number"
            step="0.01"
            placeholder="99.99"
            {...register("price", {
              required: "Price is required",
              min: { value: 0.01, message: "Price must be greater than 0" },
            })}
            error={errors.price?.message}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Category
              </span>
              <button
                type="button"
                onClick={() => setShowQuickCat((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                {showQuickCat ? "Close" : "+ New Category"}
              </button>
            </div>
            <Select
              options={categoryOptions}
              placeholder="Select Category"
              {...register("categoryId", { required: "Category is required" })}
              error={errors.categoryId?.message}
            />
          </div>
        </div>

        {/* Inline Quick Add Category Panel */}
        {showQuickCat && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" /> Quick Create & Add Category
              </span>
              <Link href="/admin/categories" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                Open Full Category Manager →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="New Category Name"
                placeholder="e.g. Smart Gadgets"
                value={quickCatName}
                onChange={(e) => setQuickCatName(e.target.value)}
              />
              <Input
                label="Category Image URL"
                placeholder="https://..."
                value={quickCatImage}
                onChange={(e) => setQuickCatImage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowQuickCat(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={Plus}
                isLoading={isCreatingCategory}
                onClick={handleQuickCreateCategory}
              >
                Add & Select Category
              </Button>
            </div>
          </div>
        )}

        <ImageUpload
          label="Product Image"
          value={imageUrl}
          onChange={setImageUrl}
        />

        <div>
          <label className="form-label">Description</label>
          <textarea
            rows="4"
            placeholder="Detailed description of features, materials, dimensions..."
            className={`textarea-field ${errors.description ? "input-error" : ""}`}
            {...register("description", { required: "Description is required" })}
          ></textarea>
          {errors.description && (
            <p className="error-message">{errors.description.message}</p>
          )}
        </div>
      </div>

      <div
        style={{
          paddingTop: "1rem",
          marginTop: "1rem",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          icon={Save}
          className="w-full sm:w-auto"
        >
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
