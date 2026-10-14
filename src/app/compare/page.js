"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import {
  selectComparisonItems,
  removeFromComparison,
  clearComparison,
  hydrateComparison,
} from "@/redux/slices/comparisonSlice";
import { addToCart } from "@/redux/slices/cartSlice";
import { addToast } from "@/redux/slices/uiSlice";
import { formatCurrency, cleanImageUrl } from "@/utils/formatters";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Scale,
  Trash2,
  ShoppingCart,
  ArrowLeft,
  X,
  ExternalLink,
  CheckCircle,
  Tag,
} from "lucide-react";

export default function ComparePage() {
  const dispatch = useDispatch();
  const items = useSelector(selectComparisonItems);

  useEffect(() => {
    dispatch(hydrateComparison());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(addToast({ message: `Added "${product.title}" to cart!`, type: "success" }));
  };

  const handleRemove = (id, title) => {
    dispatch(removeFromComparison(id));
    dispatch(addToast({ message: `Removed "${title}" from comparison`, type: "info" }));
  };

  const handleClear = () => {
    dispatch(clearComparison());
    dispatch(addToast({ message: "Cleared all items from comparison", type: "info" }));
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={Scale}
          title="No Products in Comparison"
          description="You haven't added any products to compare yet. Browse our catalog and click the compare icon on up to 4 items."
          actionText="Explore Catalog"
          actionHref="/products"
        />
      </div>
    );
  }

  // Find lowest price among compared items to highlight best value
  const minPrice = Math.min(...items.map((i) => i.price));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-indigo-600" />
            Product Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comparing <span className="font-bold text-slate-900">{items.length}</span> of 4 allowed products side by side
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/products">
            <Button variant="outline" size="sm">
              Add More Products
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            icon={Trash2}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <tbody>
            {/* Row 1: Product Header / Images */}
            <tr className="border-b border-slate-100">
              <td className="p-4 sm:p-6 w-44 font-bold text-xs uppercase tracking-wider text-slate-400 bg-slate-50/50 align-top">
                Product
              </td>
              {items.map((item) => {
                const isBestPrice = items.length > 1 && item.price === minPrice;
                return (
                  <td key={item.id} className="p-4 sm:p-6 align-top border-l border-slate-100 relative group">
                    <button
                      onClick={() => handleRemove(item.id, item.title)}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="space-y-3 pr-6">
                      <div className="w-full aspect-square max-w-[200px] rounded-2xl bg-slate-50 overflow-hidden border border-slate-100">
                        <img
                          src={cleanImageUrl(item.image, null, item.title)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {isBestPrice && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Best Value
                        </span>
                      )}

                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2">
                        {item.title}
                      </h3>

                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="primary"
                          fullWidth
                          icon={ShoppingCart}
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Price */}
            <tr className="border-b border-slate-100">
              <td className="p-4 sm:p-6 font-bold text-xs uppercase tracking-wider text-slate-400 bg-slate-50/50">
                Price
              </td>
              {items.map((item) => (
                <td key={item.id} className="p-4 sm:p-6 border-l border-slate-100">
                  <span className="text-xl font-black text-indigo-600">
                    {formatCurrency(item.price)}
                  </span>
                </td>
              ))}
            </tr>

            {/* Row 3: Category */}
            <tr className="border-b border-slate-100">
              <td className="p-4 sm:p-6 font-bold text-xs uppercase tracking-wider text-slate-400 bg-slate-50/50">
                Category
              </td>
              {items.map((item) => (
                <td key={item.id} className="p-4 sm:p-6 border-l border-slate-100">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    <Tag className="w-3 h-3 text-indigo-500" />
                    {item.categoryName || item.category?.name || "General"}
                  </span>
                </td>
              ))}
            </tr>

            {/* Row 4: Description */}
            <tr className="border-b border-slate-100">
              <td className="p-4 sm:p-6 font-bold text-xs uppercase tracking-wider text-slate-400 bg-slate-50/50 align-top">
                Overview
              </td>
              {items.map((item) => (
                <td key={item.id} className="p-4 sm:p-6 border-l border-slate-100 align-top">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                    {item.description || "High quality merchandise selected for exceptional reliability and style."}
                  </p>
                </td>
              ))}
            </tr>

            {/* Row 5: View Details Link */}
            <tr>
              <td className="p-4 sm:p-6 font-bold text-xs uppercase tracking-wider text-slate-400 bg-slate-50/50">
                Full Details
              </td>
              {items.map((item) => (
                <td key={item.id} className="p-4 sm:p-6 border-l border-slate-100">
                  <Link
                    href={`/products/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    View Product Page <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

