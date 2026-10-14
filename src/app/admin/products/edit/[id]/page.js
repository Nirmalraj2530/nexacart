"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/redux/services/productApi";
import { addToast } from "@/redux/slices/uiSlice";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductDetailsSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const productId = params?.id;

  const {
    data: product,
    isLoading: isFetchingProduct,
    isError,
    error,
    refetch,
  } = useGetProductByIdQuery(productId, { skip: !productId });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const handleUpdate = async (formData) => {
    try {
      await updateProduct({ id: productId, ...formData }).unwrap();
      dispatch(
        addToast({
          message: `Product "${formData.title}" updated successfully!`,
          type: "success",
        })
      );
      router.push("/admin/products");
    } catch (err) {
      console.error("Failed to update product:", err);
      dispatch(
        addToast({
          message: err?.data?.message || "Failed to update product.",
          type: "error",
        })
      );
    }
  };

  if (isFetchingProduct) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ProductDetailsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Could Not Fetch Product"
          message={error?.data?.message || "Product data failed to load for editing."}
          onRetry={refetch}
        />
      </div>
    );
  }

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
          Edit Product #{productId}
        </h1>
      </div>

      <ProductForm
        initialValues={product}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
        isEdit={true}
      />
    </div>
  );
}
