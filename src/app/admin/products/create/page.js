"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useCreateProductMutation } from "@/redux/services/productApi";
import { addToast } from "@/redux/slices/uiSlice";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateProductPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleCreate = async (formData) => {
    try {
      const result = await createProduct(formData).unwrap();
      dispatch(
        addToast({
          message: `Successfully created product "${result.title || formData.title}"!`,
          type: "success",
        })
      );
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      dispatch(
        addToast({
          message: error?.data?.message || "Failed to create product. Please try again.",
          type: "error",
        })
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Create New Product
        </h1>
      </div>

      <ProductForm onSubmit={handleCreate} isLoading={isLoading} isEdit={false} />
    </div>
  );
}
