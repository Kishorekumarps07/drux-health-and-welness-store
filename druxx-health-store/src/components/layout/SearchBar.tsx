"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useMarketplaceStore } from "@/store/marketplaceStore";

export function SearchBar() {
  const router = useRouter();
  const { 
    products, 
    searchQuery, 
    setSearchQuery, 
    setCategory, 
    isLoading,
    categories,
    fetchCategories,
    suggestions,
    fetchSuggestions
  } = useMarketplaceStore();

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [fetchCategories, categories.length]);



  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync local query with global search state
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Debounced backend suggestions
  useEffect(() => {
    if (!localQuery.trim()) {
      return;
    }
    const timer = setTimeout(() => {
      fetchSuggestions(localQuery);
      setShowSuggestions(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, fetchSuggestions]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!localQuery.trim() && selectedCategory === "All") return;
    
    setSearchQuery(localQuery);
    setCategory(selectedCategory);
    
    const params = new URLSearchParams();
    if (localQuery) params.set("q", localQuery);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    router.push(`/products?${params.toString()}`);
    
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setLocalQuery("");
    setShowSuggestions(false);
  };



  const [placeholder, setPlaceholder] = useState("Search health products...");

  useEffect(() => {
    setPlaceholder(window.innerWidth < 640 ? "Search..." : "Search across thousands of health and wellness products...");
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-[800px]" id="search-bar">
      <form 
        onSubmit={handleSearch} 
        className={`flex h-11 lg:h-12 bg-white rounded-full border border-gray-200 hover:border-gray-300 focus-within:border-[#A6D608] focus-within:ring-4 focus-within:ring-[#A6D608]/10 transition-all overflow-hidden shadow-sm group/form ${
          showSuggestions && suggestions.length > 0 ? "shadow-xl border-gray-300" : ""
        }`}
      >


        {/* Input - Middle */}
        <div className="relative flex-1 h-full">
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => localQuery && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full h-full px-6 text-[15px] font-medium outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
            id="search-input"
            autoComplete="off"
          />
          {localQuery && (
            <button
              type="button"
              onClick={() => {
                setLocalQuery("");
                fetchSuggestions("");
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors bg-white p-1 rounded-full"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search button - Right */}
        <button
          type="submit"
          id="search-submit-btn"
          className="flex items-center justify-center w-12 lg:w-[4rem] bg-[#A6D608] hover:bg-[#8ab506] text-black transition-all duration-300 group/submit border-none"
          aria-label="Search"
        >
          <Search size={20} strokeWidth={3} className="transition-transform group-active/submit:scale-90" />
        </button>
      </form>

      {/* Rich Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-3">
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50 mb-3">
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Recommended Products</p>
               <Link href={`/products?q=${localQuery}`} className="text-[11px] font-bold text-[#A6D608] hover:text-[#8ab506] transition-colors">View All Results</Link>
            </div>
            <div className="space-y-1 max-h-[440px] overflow-y-auto custom-scrollbar">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSuggestionClick(product.slug)}
                  className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-gray-50 transition-all text-left group/suggestion"
                >
                  <div className="relative w-12 h-12 rounded-lg border border-gray-100 bg-white flex-shrink-0 overflow-hidden p-1 shadow-sm">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                       <span className="px-1.5 py-0.5 bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-tighter rounded">
                          {product.category}
                       </span>
                       {product.isBestSeller && (
                          <span className="text-[10px] font-black text-[#FF7A00]">BEST SELLER</span>
                       )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 truncate group-hover/suggestion:text-[#A6D608] transition-colors leading-none">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#1E1E1E]">₹{product.price}</p>
                    {product.discount > 0 && (
                       <p className="text-[11px] text-green-600 font-bold">{product.discount}% OFF</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <button
               onClick={handleSearch}
               className="w-full py-4 bg-gray-50/50 hover:bg-gray-50 text-[11px] font-bold text-gray-500 transition-all border-t border-gray-100 mt-3 flex items-center justify-center gap-2 group/more"
            >
               <Search size={14} className="group-hover/more:scale-110 transition-transform" /> See more results for &quot;{localQuery}&quot;
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {showSuggestions && localQuery && suggestions.length === 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-8 text-center flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
           <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
              <Search size={20} className="text-gray-300" />
           </div>
           <p className="text-sm font-bold text-gray-800">No products found for &quot;{localQuery}&quot;</p>
           <p className="text-xs text-gray-400">Try searching with broader terms or different categories.</p>
        </div>
      )}
    </div>
  );
}
