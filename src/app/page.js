"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGetProductsQuery, useGetCategoriesQuery } from "@/redux/services/productApi";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton, CategoryCardSkeleton } from "@/components/common/Skeleton";
import { HomeHeroSlider } from "@/components/home/HomeHeroSlider";
import { Button } from "@/components/common/Button";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Flame,
  Clock,
  Tag,
} from "lucide-react";
import { cleanImageUrl } from "@/utils/formatters";

export default function HomePage() {
  const router = useRouter();
  const { isAdmin, isManager, isHydrated } = useAuth();
  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery();
  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoriesQuery();

  useEffect(() => {
    if (isHydrated && (isAdmin || isManager)) {
      const target = localStorage.getItem("nexacart_last_admin_path") || "/admin";
      router.replace(target);
    }
  }, [isHydrated, isAdmin, isManager, router]);

  const featuredProducts = products.slice(0, 4);
  const flashDealProducts = products.slice(4, 8);
  const latestProducts = products.slice(8, 16);
  const recommendedProducts = products.slice(16, 20);

  const displayCategories = categories.slice(0, 6);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Production-Grade Hero Slider */}
      <HomeHeroSlider />

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore Categories
            </h2>
            <p className="text-sm text-slate-500 mt-1">Browse products by your favorite department</p>
          </div>
          <Link href="/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {isCategoriesLoading
            ? Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)
            : displayCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.id}`}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-slate-200/80 p-5 hover:border-indigo-400 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-3"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                    <img
                      src={cleanImageUrl(cat.image)}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Featured Products
            </h2>
            <p className="text-sm text-slate-500 mt-1">Handpicked bestsellers chosen for exceptional quality</p>
          </div>
          <Link href="/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            See More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isProductsLoading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* Flash Deals / Limited Time Offers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/20 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 text-xs font-black uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                Lightning Deals of the Day
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Up to 40% Off Limited Stock
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Special daily markdowns with complimentary express delivery.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Extra 20% Off:</span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-mono font-black text-indigo-600 text-xs sm:text-sm shadow-xs">
                Code: NEXA20
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isProductsLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : flashDealProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 sm:p-12 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Limited Time Offer</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Upgrade Your Style Today.</h2>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Get up to 30% discount on electronics & footwear. Free doorstep delivery on orders over $50.
            </p>
            <Link href="/products" className="inline-block pt-2">
              <Button size="lg" variant="secondary" icon={ArrowRight} className="font-bold">
                Shop The Sale
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Latest Arrivals
            </h2>
            <p className="text-sm text-slate-500 mt-1">Fresh items added to our store this week</p>
          </div>
          <Link href="/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            Explore All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isProductsLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* Product Recommendations */}
      {recommendedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Recommended For You
            </h2>
            <p className="text-sm text-slate-500 mt-1">Top picks based on popular customer preferences</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
