"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import {
  selectWishlistItems,
  removeFromWishlist,
  clearWishlist,
  hydrateWishlist,
} from "@/redux/slices/wishlistSlice";
import { addToCart } from "@/redux/slices/cartSlice";
import { addToast } from "@/redux/slices/uiSlice";
import { formatCurrency, cleanImageUrl } from "@/utils/formatters";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";

export default function AccountWishlistPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  useEffect(() => {
    dispatch(hydrateWishlist());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(addToast({ message: `Added "${product.title}" to cart!`, type: "success" }));
  };

  const handleRemove = (id, title) => {
    dispatch(removeFromWishlist(id));
    dispatch(addToast({ message: `Removed "${title}" from wishlist`, type: "info" }));
  };

  const handleClear = () => {
    dispatch(clearWishlist());
    dispatch(addToast({ message: "Cleared all items from wishlist", type: "info" }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            My Saved Wishlist
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You have <span className="font-bold text-slate-900">{items.length}</span> items in your saved collection
          </p>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-rose-600 hover:bg-rose-50"
            icon={Trash2}
          >
            Clear Wishlist
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <EmptyState
            icon={Heart}
            title="Your Wishlist is Empty"
            description="Explore our curated catalog and tap the heart icon to save products for later."
            actionText="Discover Products"
            actionHref="/products"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-full aspect-square rounded-2xl bg-slate-100 overflow-hidden relative">
                  <img
                    src={cleanImageUrl(item.image, null, item.title)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemove(item.id, item.title)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-white shadow-xs transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                    {item.categoryName || "General"}
                  </span>
                  <Link href={`/products/${item.id}`}>
                    <h3 className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-sm font-black text-slate-900">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  variant="primary"
                  fullWidth
                  icon={ShoppingCart}
                  onClick={() => handleAddToCart(item)}
                >
                  Move to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

