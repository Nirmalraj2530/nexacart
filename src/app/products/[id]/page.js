"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useGetProductByIdQuery } from "@/redux/services/productApi";
import { addToCart, setPendingCartItem } from "@/redux/slices/cartSlice";
import {
  addToComparison,
  removeFromComparison,
  selectIsInComparison,
} from "@/redux/slices/comparisonSlice";
import { addToast } from "@/redux/slices/uiSlice";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, cleanImageUrl, getCategoryCuratedImage } from "@/utils/formatters";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { ProductReviews } from "@/components/product/ProductReviews";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ProductDetailsSkeleton } from "@/components/common/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/common/Button";
import {
  ShoppingBag,
  Plus,
  Minus,
  ChevronLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Share2,
  Heart,
  Clock,
  Scale,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, openLogin } = useAuth();
  const productId = params?.id;

  const { data: product, isLoading, isError, error, refetch } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  const isInComparison = useSelector(selectIsInComparison(product?.id));

  const [quantity, setQuantity] = useState(1);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  // Save product to recently viewed browsing history
  useEffect(() => {
    if (product && product.id) {
      try {
        const stored = JSON.parse(localStorage.getItem("nexacart_recently_viewed") || "[]");
        const filtered = stored.filter((p) => p.id !== product.id);
        const updated = [
          {
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image || (Array.isArray(product.images) ? product.images[0] : null),
            category: product.category,
          },
          ...filtered,
        ].slice(0, 6);
        localStorage.setItem("nexacart_recently_viewed", JSON.stringify(updated));
      } catch {}
    }
  }, [product]);

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorState
          title="Product Failed To Load"
          message={error?.data?.message || "Could not retrieve details for this item."}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!product || !product.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          title="Product Not Found"
          description="The item you are looking for does not exist or has been removed."
          actionText="Back to Catalog"
          actionHref="/products"
        />
      </div>
    );
  }

  const categoryName = product.category?.name || "General";

  // Handle images array
  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image];

  const currentMainImage = imgError
    ? getCategoryCuratedImage(categoryName, `${product.id}-${selectedImgIndex}`)
    : cleanImageUrl(rawImages[selectedImgIndex] || rawImages[0], null, categoryName);

  const handleAddToCart = () => {
    // Flipkart-style: Require login before adding items to cart
    if (!isAuthenticated) {
      dispatch(setPendingCartItem({ product, quantity }));
      dispatch(
        addToast({
          message: "Please sign in to add items to your cart",
          type: "warning",
        })
      );
      openLogin();
      return;
    }

    dispatch(addToCart({ product, quantity }));
    dispatch(
      addToast({
        message: `Added ${quantity} x "${product.title}" to cart!`,
        type: "success",
      })
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      dispatch(addToast({ message: "Product link copied to clipboard!", type: "info" }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb / Back Link */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Catalog
        </button>
      </div>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
            <img
              src={currentMainImage}
              alt={product.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center"
            />
            <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {product.category?.name || "General"}
            </span>
          </div>

          {/* Thumbnail Strip */}
          {rawImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {rawImages.map((img, idx) => {
                const cleaned = cleanImageUrl(img, null, `${categoryName}-${idx}`);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImgIndex(idx);
                      setImgError(false);
                    }}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedImgIndex === idx
                        ? "border-indigo-600 ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <img src={cleaned} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Info & Actions */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {product.category?.name}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isInComparison) {
                      dispatch(removeFromComparison(product.id));
                      dispatch(addToast({ message: `Removed "${product.title}" from comparison`, type: "info" }));
                    } else {
                      dispatch(addToComparison(product));
                      dispatch(addToast({ message: `Added "${product.title}" to comparison (max 4)`, type: "success" }));
                    }
                  }}
                  className={`p-2 rounded-full border transition-colors ${
                    isInComparison
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:text-indigo-600 hover:bg-slate-100"
                  }`}
                  title={isInComparison ? "Remove from comparison" : "Compare with other products"}
                  aria-label="Compare product"
                >
                  <Scale className="w-5 h-5" />
                </button>
                <WishlistButton product={product} size="md" />
                <button
                  onClick={handleShare}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                  title="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <span className="text-sm font-bold text-slate-900">5.0</span>
              <span className="text-sm text-slate-400">· 24 Customer Reviews</span>
            </div>

            {/* Price display */}
            <div className="pt-2">
              <span className="text-3xl font-black text-slate-900">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs text-slate-400 block mt-1">In Stock & Ready To Ship</span>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          {/* Quantity & Add to Cart Section */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-900">Quantity</span>
              <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-l-xl transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-1 text-sm font-bold text-slate-900 select-none min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-r-xl transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                variant="primary"
                icon={ShoppingBag}
                onClick={handleAddToCart}
                className="flex-1 shadow-lg shadow-indigo-600/20 font-bold"
              >
                Add To Shopping Cart
              </Button>
            </div>
          </div>

            {/* Features Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-slate-200 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
              <Truck className="w-5 h-5 text-indigo-600 mx-auto" />
              <span className="text-xs font-bold text-slate-900 block">Fast Delivery</span>
              <span className="text-[10px] text-slate-500">2-4 Business Days</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto" />
              <span className="text-xs font-bold text-slate-900 block">Original Product</span>
              <span className="text-[10px] text-slate-500">100% Genuine</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
              <RotateCcw className="w-5 h-5 text-indigo-600 mx-auto" />
              <span className="text-xs font-bold text-slate-900 block">30-Day Returns</span>
              <span className="text-[10px] text-slate-500">Hassle-free guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <ProductReviews productId={product.id} />

      {/* Related Products Section */}
      <RelatedProducts productId={product.id} categoryId={product.category?.id} />

      {/* Recently Viewed Products */}
      <RecentlyViewed currentProductId={product.id} />

      {/* Mobile Sticky Bottom Purchase Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl z-30 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Price</span>
          <span className="text-lg font-black text-slate-900 leading-none">
            {formatCurrency(product.price * quantity)}
          </span>
        </div>
        <Button
          size="md"
          variant="primary"
          icon={ShoppingBag}
          onClick={handleAddToCart}
          className="font-bold shadow-md shadow-indigo-600/20"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
