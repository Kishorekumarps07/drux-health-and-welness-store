"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { ProductCard } from "@/components/products/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types";
import { productService } from "@/services/productService";
import { ProductSkeleton } from "@/components/products/ProductSkeleton";

interface ProductGridProps {
  products: Product[];
}

function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product as any} />
      ))}
    </div>
  );
}

export function FeaturedProducts() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [fRes, bRes, nRes] = await Promise.all([
          productService.getFeatured(),
          productService.getBestSellers(),
          productService.getNewArrivals(),
        ]);
        setFeatured(fRes.products);
        setBestSellers(bRes.products);
        setNewArrivals(nRes.products);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <section className="py-10 sm:py-12 px-1 sm:px-10">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-row items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <p className="text-[#A6D608] font-bold uppercase tracking-[0.2em] text-[8px] sm:text-xs mb-1 sm:mb-2">Curated Selection</p>
            <h2 className="text-lg sm:text-5xl font-black text-[#1E1E1E] uppercase tracking-tighter leading-[0.9]">
              Top Health <br />Essentials.
            </h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-[#A6D608]/10 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#1E1E1E] transition-all group shrink-0 border border-gray-100"
          >
            All <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>


        {/* Tabs */}
        <Tabs defaultValue="featured" className="w-full">
          <div className="w-full overflow-x-auto touch-pan-x hide-scrollbar mb-8 sm:mb-12">
            <TabsList className="bg-gray-100/50 p-1 rounded-2xl flex w-fit min-w-full sm:min-w-0">
              <TabsTrigger
                value="featured"
                className="rounded-xl px-6 sm:px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-[10px] sm:text-[12px] uppercase tracking-widest whitespace-nowrap"
              >
                Featured
              </TabsTrigger>
              <TabsTrigger
                value="bestsellers"
                className="rounded-xl px-6 sm:px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-[10px] sm:text-[12px] uppercase tracking-widest whitespace-nowrap"
              >
                🔥 Best Sellers
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="rounded-xl px-6 sm:px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-[10px] sm:text-[12px] uppercase tracking-widest whitespace-nowrap"
              >
                ✨ New Arrivals
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="featured" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {loading ? <SkeletonGrid /> : <ProductGrid products={featured} />}
           </TabsContent>
           <TabsContent value="bestsellers" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {loading ? <SkeletonGrid /> : <ProductGrid products={bestSellers} />}
           </TabsContent>
           <TabsContent value="new" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {loading ? <SkeletonGrid /> : <ProductGrid products={newArrivals} />}
           </TabsContent>
         </Tabs>
      </div>
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
