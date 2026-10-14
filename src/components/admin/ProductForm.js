"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useGetCategoriesQuery } from "@/redux/services/productApi";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ProductForm({ initialValues, onSubmit, isLoading, isEdit = false }) {
  const { data: categories = [] } = useGetCategoriesQuery();

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

  const defaultImg = Array.isArray(initialValues?.images) && initialValues.images.length > 0
    ? initialValues.images[0]
    : typeof initialValues?.images === "string"
    ? initialValues.images
    : "https://picsum.photos/600/600";

  const [imageUrl, setImageUrl] = useState(defaultImg);

  useEffect(() => {
    if (initialValues) {
      setValue("title", initialValues.title || "");
      setValue("price", initialValues.price || "");
      setValue("description", initialValues.description || "");
      setValue("categoryId", initialValues.category?.id || initialValues.categoryId || "");
    }
  }, [initialValues, setValue]);

  const onFormSubmit = (data) => {
    const formattedData = {
      title: data.title,
      price: Number(data.price),
      description: data.description,
      categoryId: Number(data.categoryId) || 1,
      images: [imageUrl || "https://picsum.photos/600/600"],
    };
    onSubmit(formattedData);
  };

  const categoryOptions = categories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="summary-card" style={{ padding: "clamp(1rem, 3vw, 2rem)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, margin: 0 }}>
            {isEdit ? "Edit Product Details" : "Create New Product"}
          </h2>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", margin: "0.25rem 0 0" }}>
            Fill out product metadata and upload image asset (POST /files/upload)
          </p>
        </div>
        <Link href="/admin/products">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Cancel
          </Button>
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <Input
          label="Product Title"
          placeholder="e.g. Premium Wireless Headphones"
          {...register("title", { required: "Title is required" })}
          error={errors.title?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <Select
            label="Category"
            options={categoryOptions}
            placeholder="Select Category"
            {...register("categoryId", { required: "Category is required" })}
            error={errors.categoryId?.message}
          />
        </div>

        <ImageUpload
          label="Product Image Asset (POST /files/upload)"
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

      <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "flex-end" }}>
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
