"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types";
import { useState, useEffect } from "react";
import { productService } from "@/services/productService";

interface ProductGridProps {
  products: Product[];
}

function ProductGrid({ products }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(16);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 16);
  };

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <div className="flex flex-col items-center w-full">
      {visibleProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm font-semibold">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 w-full">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
      {hasMore && (
        <button 
          onClick={handleLoadMore}
          className="mt-8 px-8 py-3 bg-white border border-gray-200 hover:border-[#A6D608] hover:text-[#A6D608] rounded-full text-xs font-black uppercase tracking-widest text-[#1E1E1E] transition-all shadow-sm"
        >
          Load More
        </button>
      )}
    </div>
  );
}

interface FeaturedProductsProps {
  featured: Product[];
  bestSellers: Product[];
  newArrivals: Product[];
}

export function FeaturedProducts({ featured, bestSellers, newArrivals }: FeaturedProductsProps) {
  const [personalized, setPersonalized] = useState<Product[]>([]);
  const [loadingPersonalized, setLoadingPersonalized] = useState(true);

  useEffect(() => {
    async function loadPersonalized() {
      try {
        let guestCats: string[] = [];
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("druxx_viewed_categories");
          if (stored) {
            guestCats = JSON.parse(stored);
          }
        }
        const res = await productService.getPersonalizedProducts(guestCats);
        setPersonalized(res.products || []);
      } catch (err) {
        console.error("Failed to load personalized recommendations", err);
      } finally {
        setLoadingPersonalized(false);
      }
    }
    loadPersonalized();
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
              <TabsTrigger
                value="personalized"
                className="rounded-xl px-6 sm:px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-black text-[10px] sm:text-[12px] uppercase tracking-widest whitespace-nowrap"
              >
                ✨ For You
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="featured" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProductGrid products={featured} />
          </TabsContent>
          <TabsContent value="bestsellers" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProductGrid products={bestSellers} />
          </TabsContent>
          <TabsContent value="new" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProductGrid products={newArrivals} />
          </TabsContent>
          <TabsContent value="personalized" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loadingPersonalized ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 w-full animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-3xl h-80 w-full" />
                ))}
              </div>
            ) : (
              <ProductGrid products={personalized} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
