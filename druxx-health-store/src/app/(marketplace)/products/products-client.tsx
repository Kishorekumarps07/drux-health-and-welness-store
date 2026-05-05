"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  X,
  Search,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import { productService } from "@/services/productService";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductListSkeleton } from "@/components/products/ProductSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  
  const { 
    products, 
    totalProducts, 
    totalPages, 
    currentPage, 
    isLoading,
    error,
    searchQuery,
    category,
    priceRange,
    rating,
    sort,
    setSearchQuery,
    setCategory,
    setPriceRange,
    setRating,
    setSort,
    setPage,
    fetchProducts,
    clearFilters
  } = useMarketplaceStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync URL params with store on mount/URL change
  useEffect(() => {
    if (!mounted) return;
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "All";
    
    if (q !== searchQuery) setSearchQuery(q);
    if (cat !== category) setCategory(cat);
  }, [searchParams, mounted, searchQuery, category, setSearchQuery, setCategory]);

  // Fetch when filters change
  useEffect(() => {
    if (mounted) {
      fetchProducts();
    }
  }, [mounted, searchQuery, category, priceRange, rating, sort, currentPage, fetchProducts]);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadMore = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#A6D608] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Desktop Header / Mobile Sticky Trigger */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-black text-2xl md:text-3xl text-[#1E1E1E]">
                {category !== "All" 
                  ? category
                  : searchQuery 
                    ? `Results for "${searchQuery}"` 
                    : "All Wellness Products"
                }
              </h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                {totalProducts} Premium Items Available
              </p>
            </div>
            
            {/* Mobile View Toggle */}
            <div className="sm:hidden flex items-center bg-white rounded-xl border border-gray-100 p-1 scale-90 origin-right">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-[#A6D608] text-[#1E1E1E]" : "text-gray-400"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-[#A6D608] text-[#1E1E1E]" : "text-gray-400"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 sticky top-0 z-40 md:static bg-[#F7F7F7] py-2 -mx-4 px-4 md:p-0">
            {/* View Toggle (Desktop) */}
            <div className="hidden sm:flex items-center bg-white rounded-xl border border-gray-100 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-gray-100 text-[#A6D608]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-gray-100 text-[#A6D608]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            {/* Sort Button / Mobile Drawer Trigger */}
            <div className="flex-1 md:flex-none flex gap-2">
               {/* Native-style Sort Drawer (Mobile) */}
               <Drawer>
                 <DrawerTrigger 
                   className="md:hidden flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#1E1E1E] text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-transform"
                   id="mobile-sort-trigger"
                 >
                   <ChevronDown size={14} className="text-[#A6D608]" strokeWidth={3} />
                   Sort: {sort.replace("-", " ")}
                 </DrawerTrigger>
                 <DrawerContent className="rounded-t-[3rem] px-6 pb-12">
                   <div className="mx-auto w-12 h-1.5 bg-gray-200 rounded-full my-4" />
                   <DrawerTitle className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#A6D608] mb-6">Sort Selection</DrawerTitle>
                   <div className="space-y-2">
                      {[
                        { id: "featured", label: "Featured" },
                        { id: "price-low", label: "Price: Low to High" },
                        { id: "price-high", label: "Price: High to Low" },
                        { id: "rating", label: "Top Customer Rating" },
                        { id: "newest", label: "Newest Arrivals" }
                      ].map((opt) => (
                        <DrawerClose key={opt.id} asChild>
                          <button
                            onClick={() => { setSort(opt.id); }}
                            className={`w-full text-left p-5 rounded-2xl font-bold text-sm transition-all ${
                              sort === opt.id ? "bg-[#A6D608] text-[#1E1E1E] shadow-lg shadow-[#A6D608]/20" : "bg-gray-50 text-gray-600 active:scale-[0.98]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        </DrawerClose>
                      ))}
                   </div>
                 </DrawerContent>
               </Drawer>

               {/* Mobile Filter Trigger (Slide-up Drawer) */}
               <Drawer>
                <DrawerTrigger
                  className="md:hidden flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-white border-2 border-gray-100 text-[#1E1E1E] font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-transform"
                  id="mobile-filter-trigger"
                >
                  <Filter size={14} className="text-[#A6D608]" strokeWidth={3} />
                  Filters
                </DrawerTrigger>
                <DrawerContent className="h-[85vh] rounded-t-[3rem] px-6 pb-12">
                  <div className="mx-auto w-12 h-1.5 bg-gray-200 rounded-full my-4" />
                  <div className="flex items-center justify-between mb-8">
                    <DrawerTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A6D608]">Marketplace Filters</DrawerTitle>
                    <button onClick={clearFilters} className="text-[10px] font-black uppercase text-red-500">Reset</button>
                  </div>
                  <div className="overflow-y-auto px-1 h-full pb-20">
                    <FilterSidebar 
                      priceRange={priceRange} 
                      setPriceRange={setPriceRange}
                      selectedRating={rating}
                      setSelectedRating={setRating}
                      selectedCategory={category}
                      onClear={clearFilters}
                    />
                  </div>
                  <DrawerFooter className="px-0 pt-4">
                    <DrawerClose asChild>
                      <Button className="w-full h-14 rounded-2xl bg-[#A6D608] text-[#1E1E1E] font-black uppercase tracking-widest text-xs shadow-xl shadow-[#A6D608]/20 active:scale-95 transition-transform">
                        Show {totalProducts} Results
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Desktop Sort Dropdown */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-100 bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
                  id="sort-dropdown-trigger"
                >
                  <span>Sort by: {sort.replace("-", " ")}</span>
                  <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-xl">
                  <DropdownMenuItem onClick={() => setSort("featured")}>Featured</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("price-low")}>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("price-high")}>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("rating")}>Avg. Customer Rating</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("newest")}>Newest Arrivals</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || category !== "All") && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Active:</span>
            {searchQuery && (
              <Badge variant="secondary" className="bg-white border-gray-100 px-3 py-1.5 rounded-lg gap-2 text-sm font-medium">
                Search: {searchQuery}
                <X size={14} className="cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {category !== "All" && (
              <Badge variant="secondary" className="bg-[#A6D608]/10 text-[#A6D608] border-[#A6D608]/20 px-3 py-1.5 rounded-lg gap-2 text-sm font-medium">
                {category}
                <X size={14} className="cursor-pointer" onClick={() => setCategory("All")} />
              </Badge>
            )}
            <button 
              onClick={clearFilters}
              className="text-xs font-bold text-red-500 hover:text-red-600 ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-28 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <FilterSidebar 
                priceRange={priceRange} 
                setPriceRange={setPriceRange}
                selectedRating={rating}
                setSelectedRating={setRating}
                selectedCategory={category}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {isLoading ? (
              <ProductListSkeleton count={9} />
            ) : error ? (
              <EmptyState
                icon={AlertCircle}
                title="Failed to load products"
                description={error || "An unexpected error occurred while fetching products."}
                action={{
                  label: "Try Again",
                  onClick: fetchProducts
                }}
              />
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More */}
                {currentPage < totalPages && (
                  <div className="mt-12 flex justify-center">
                    <Button 
                      onClick={loadMore}
                      variant="outline" 
                      className="rounded-xl px-12 border-2 border-gray-100 font-bold hover:bg-[#A6D608] hover:text-[#1E1E1E] transition-all h-12"
                    >
                      Load More Products
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Search}
                title="No products found"
                description="We couldn't find any products matching your current filters. Try relaxing some criteria."
                action={{
                  label: "Reset All Filters",
                  onClick: clearFilters
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPageClient() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}

function FilterSidebar({ 
  priceRange, 
  setPriceRange, 
  selectedRating, 
  setSelectedRating,
  selectedCategory,
  onClear 
}: {
  priceRange: [number, number];
  setPriceRange: (val: [number, number]) => void;
  selectedRating: number | null;
  setSelectedRating: (val: number | null) => void;
  selectedCategory: string;
  onClear: () => void;
}) {
  const { setCategory, categories: storeCategories } = useMarketplaceStore();
  const categories = storeCategories.length > 0 ? storeCategories : [
    { id: "1", name: "Vitamins", slug: "vitamins", icon: "💊", productCount: 120 },
    { id: "2", name: "Supplements", slug: "supplements", icon: "🧴", productCount: 85 },
    { id: "3", name: "Organic Food", slug: "organic-food", icon: "🥦", productCount: 64 },
    { id: "4", name: "Herbal", slug: "herbal", icon: "🌿", productCount: 42 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-gray-400">Categories</h3>
        </div>
        <div className="space-y-2">
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.name)}
              className={`flex items-center justify-between w-full p-2 rounded-xl transition-colors text-sm ${
                selectedCategory === cat.name 
                  ? "bg-[#A6D608]/10 text-[#A6D608] font-bold" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{cat.icon}</span>
                {cat.name}
              </span>
              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-md font-bold text-gray-400">
                {cat.productCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-gray-50" />

      <div>
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-gray-400 mb-6">Price Range</h3>
        <Slider
          max={5000}
          step={100}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}+</span>
        </div>
      </div>

      <Separator className="bg-gray-50" />

      <div>
        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Customer Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
              className={`flex items-center gap-3 w-full p-2 rounded-xl transition-colors text-sm ${
                selectedRating === rating 
                  ? "bg-gray-100 text-gray-900 font-bold" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-0.5 text-[#FF7A00]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    className={i < rating ? "fill-current" : "fill-gray-200 text-gray-200"} 
                  />
                ))}
              </div>
              & Up
            </button>
          ))}
        </div>
      </div>

      <Button 
        variant="ghost" 
        onClick={onClear}
        className="w-full text-xs text-red-400 hover:text-red-500 hover:bg-red-50 font-bold uppercase tracking-widest mt-4"
      >
        Clear Filters
      </Button>
    </div>
  );
}
