"use client";

import { useState, useMemo, Suspense, useEffect, useRef } from "react";
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
  Check,
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
    categories,
    setSearchQuery,
    setCategory,
    setPriceRange,
    setRating,
    setSort,
    setPage,
    fetchProducts,
    fetchCategories,
    clearFilters
  } = useMarketplaceStore();

  useEffect(() => {
    setMounted(true);
    fetchCategories(); // Fetch categories on page mount
  }, [fetchCategories]);

  // Sync URL params with store on mount/URL change
  useEffect(() => {
    if (!mounted) return;
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "All";
    
    setSearchQuery(q);
    setCategory(cat);
  }, [searchParams, mounted]);

  // Price debouncing to prevent 429 Too Many Requests errors
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 400);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Mobile Filter Drawer Draft States
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(category);
  const [draftPriceRange, setDraftPriceRange] = useState(priceRange);
  const [draftRating, setDraftRating] = useState<number | null>(rating);
  const [activeMobileTab, setActiveMobileTab] = useState<"category" | "price" | "rating">("category");

  // Synchronize draft states when mobile drawer opens
  useEffect(() => {
    if (isFilterDrawerOpen) {
      setDraftCategory(category);
      setDraftPriceRange(priceRange);
      setDraftRating(rating);
    }
  }, [isFilterDrawerOpen, category, priceRange, rating]);

  // Fetch when filters change (using debouncedPriceRange to throttle API calls)
  useEffect(() => {
    if (mounted) {
      fetchProducts();
    }
  }, [mounted, searchQuery, category, debouncedPriceRange, rating, sort, currentPage, fetchProducts]);

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

          {/* Mobile Inline Search Bar — persists as user scrolls */}
          <div className="md:hidden mb-3">
            <MobileSearchBar />
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
                <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
                  <DrawerTrigger
                    className="md:hidden flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-white border-2 border-gray-100 text-[#1E1E1E] font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-transform"
                    id="mobile-filter-trigger"
                    onClick={() => setIsFilterDrawerOpen(true)}
                  >
                    <Filter size={14} className="text-[#A6D608]" strokeWidth={3} />
                    Filters
                  </DrawerTrigger>
                  <DrawerContent className="h-[75vh] rounded-t-[2.5rem] flex flex-col pb-0 px-0 bg-white">
                    <div className="mx-auto w-12 h-1 bg-gray-200 rounded-full my-3 shrink-0" />
                    
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100 shrink-0">
                      <DrawerTitle className="text-xs font-black uppercase tracking-widest text-gray-900">
                        Marketplace Filters
                      </DrawerTitle>
                      <button 
                        onClick={() => {
                          setDraftCategory("All");
                          setDraftPriceRange([0, 5000]);
                          setDraftRating(null);
                        }} 
                        className="text-xs font-bold uppercase text-red-500 hover:text-red-600 active:scale-95 transition-all"
                      >
                        Reset All
                      </button>
                    </div>

                    {/* Dual-Pane Body */}
                    <div className="flex flex-1 overflow-hidden min-h-0">
                      {/* Left vertical sidebar (Tabs selector) */}
                      <div className="w-[120px] bg-gray-50 flex flex-col border-r border-gray-100 shrink-0">
                        <button
                          onClick={() => setActiveMobileTab("category")}
                          className={`py-4 px-4 text-left text-xs transition-all relative ${
                            activeMobileTab === "category"
                              ? "bg-white font-bold text-[#1E1E1E]"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {activeMobileTab === "category" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A6D608]" />
                          )}
                          <span>Categories</span>
                          {draftCategory !== "All" && (
                            <span className="ml-1.5 w-2 h-2 bg-[#A6D608] rounded-full inline-block align-middle" />
                          )}
                        </button>
                        <button
                          onClick={() => setActiveMobileTab("price")}
                          className={`py-4 px-4 text-left text-xs transition-all relative ${
                            activeMobileTab === "price"
                              ? "bg-white font-bold text-[#1E1E1E]"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {activeMobileTab === "price" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A6D608]" />
                          )}
                          <span>Price Range</span>
                          {(draftPriceRange[0] > 0 || draftPriceRange[1] < 5000) && (
                            <span className="ml-1.5 w-2 h-2 bg-[#A6D608] rounded-full inline-block align-middle" />
                          )}
                        </button>
                        <button
                          onClick={() => setActiveMobileTab("rating")}
                          className={`py-4 px-4 text-left text-xs transition-all relative ${
                            activeMobileTab === "rating"
                              ? "bg-white font-bold text-[#1E1E1E]"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {activeMobileTab === "rating" && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A6D608]" />
                          )}
                          <span>Rating</span>
                          {draftRating !== null && (
                            <span className="ml-1.5 w-2 h-2 bg-[#A6D608] rounded-full inline-block align-middle" />
                          )}
                        </button>
                      </div>

                      {/* Right Panel (Content area) */}
                      <div className="flex-1 bg-white overflow-y-auto p-4">
                        {activeMobileTab === "category" && (
                          <div className="space-y-1.5">
                            <button
                              onClick={() => setDraftCategory("All")}
                              className={`flex items-center justify-between w-full p-3 rounded-xl text-left text-xs transition-all ${
                                draftCategory === "All"
                                  ? "bg-[#A6D608]/10 text-[#A6D608] font-bold"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span>All Categories</span>
                              {draftCategory === "All" && <Check size={14} className="text-[#A6D608]" />}
                            </button>
                            {categories.map((cat: any) => (
                              <button
                                key={cat.id}
                                onClick={() => setDraftCategory(cat.name)}
                                className={`flex items-center justify-between w-full p-3 rounded-xl text-left text-xs transition-all ${
                                  draftCategory === cat.name
                                    ? "bg-[#A6D608]/10 text-[#A6D608] font-bold"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{cat.icon || "📦"}</span>
                                  {cat.name}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-400">
                                    {cat.productCount}
                                  </span>
                                  {draftCategory === cat.name && <Check size={14} className="text-[#A6D608]" />}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {activeMobileTab === "price" && (
                          <div className="space-y-6 pt-2">
                            <Slider
                              max={5000}
                              step={100}
                              value={draftPriceRange}
                              onValueChange={setDraftPriceRange}
                            />
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Min Price</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                  <input
                                    type="number"
                                    value={draftPriceRange[0]}
                                    onChange={(e) => {
                                      const val = Math.min(Number(e.target.value), draftPriceRange[1] - 100);
                                      setDraftPriceRange([val >= 0 ? val : 0, draftPriceRange[1]]);
                                    }}
                                    className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#A6D608]"
                                  />
                                </div>
                              </div>
                              <div className="text-gray-400 mt-4">-</div>
                              <div className="flex-1">
                                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Max Price</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                  <input
                                    type="number"
                                    value={draftPriceRange[1]}
                                    onChange={(e) => {
                                      const val = Math.max(Number(e.target.value), draftPriceRange[0] + 100);
                                      setDraftPriceRange([draftPriceRange[0], val <= 5000 ? val : 5000]);
                                    }}
                                    className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#A6D608]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeMobileTab === "rating" && (
                          <div className="space-y-1.5">
                            {[4, 3, 2, 1].map((ratingVal) => (
                              <button
                                key={ratingVal}
                                onClick={() => setDraftRating(draftRating === ratingVal ? null : ratingVal)}
                                className={`flex items-center justify-between w-full p-3 rounded-xl text-left text-xs transition-all ${
                                  draftRating === ratingVal
                                    ? "bg-[#A6D608]/10 text-[#1E1E1E] font-bold"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-0.5 text-[#FF7A00]">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        size={12}
                                        className={i < ratingVal ? "fill-current" : "fill-gray-200 text-gray-200"}
                                      />
                                    ))}
                                  </div>
                                  <span>& Up</span>
                                </div>
                                {draftRating === ratingVal && <Check size={14} className="text-[#A6D608]" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <DrawerFooter className="px-6 py-4 border-t border-gray-100 flex-row gap-3 shrink-0 bg-white">
                      <DrawerClose asChild>
                        <Button 
                          variant="outline"
                          onClick={() => setIsFilterDrawerOpen(false)}
                          className="flex-1 h-12 rounded-2xl border-2 border-gray-100 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                        >
                          Cancel
                        </Button>
                      </DrawerClose>
                      <Button
                        onClick={() => {
                          setCategory(draftCategory);
                          setPriceRange(draftPriceRange);
                          setRating(draftRating);
                          
                          const params = new URLSearchParams(searchParams?.toString() || "");
                          if (draftCategory && draftCategory !== "All") {
                            params.set("category", draftCategory);
                          } else {
                            params.delete("category");
                          }
                          params.delete("page");
                          router.push(`/products?${params.toString()}`, { scroll: false });
                          setIsFilterDrawerOpen(false);
                        }}
                        className="flex-1 h-12 rounded-2xl bg-[#A6D608] hover:bg-[#A6D608]/90 text-[#1E1E1E] text-xs font-black uppercase tracking-widest shadow-xl shadow-[#A6D608]/20 active:scale-95 transition-all"
                      >
                        Apply Filters
                      </Button>
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
                <div className={`grid ${
                  viewMode === "grid" 
                    ? "grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 md:gap-6" 
                    : "grid-cols-1 gap-6"
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
  const categories = storeCategories.length > 0 ? storeCategories : [];
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCatClick = (catName: string) => {
    setCategory(catName);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("category", catName);
    params.delete("page");
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

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
              onClick={() => handleCatClick(cat.name)}
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

/**
 * Lightweight inline search bar for mobile — displayed above the sort/filter
 * buttons on the products page so users don't have to scroll back to the top.
 */
function MobileSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useMarketplaceStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep in sync when the store resets (e.g. clearFilters)
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearchQuery(localQuery);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (localQuery.trim()) {
      params.set("q", localQuery.trim());
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`, { scroll: false });
    inputRef.current?.blur();
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex h-11 bg-white rounded-2xl border border-gray-200 focus-within:border-[#A6D608] focus-within:ring-2 focus-within:ring-[#A6D608]/20 transition-all overflow-hidden shadow-sm"
    >
      <div className="relative flex-1 h-full">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={inputRef}
          type="search"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search products…"
          className="w-full h-full pl-10 pr-10 text-sm font-medium outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
          id="mobile-products-search-input"
          autoComplete="off"
        />
        {localQuery && (
          <button
            type="button"
            onClick={() => {
              setLocalQuery("");
              setSearchQuery("");
              const params = new URLSearchParams(searchParams?.toString() || "");
              params.delete("q");
              router.push(`/products?${params.toString()}`, { scroll: false });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="flex items-center justify-center w-11 shrink-0 bg-[#A6D608] hover:bg-[#8ab506] text-black transition-colors"
        aria-label="Search"
      >
        <Search size={16} strokeWidth={3} />
      </button>
    </form>
  );
}
