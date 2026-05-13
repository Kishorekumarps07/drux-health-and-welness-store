import { create } from "zustand";
import { Product } from "@/types";
import { productService } from "@/services/productService";

interface MarketplaceState {
  // State
  searchQuery: string;
  category: string;
  priceRange: [number, number];
  rating: number | null;
  sort: string;
  location: { city: string; pincode: string };
  
  // Data
  products: Product[];
  categories: any[];
  suggestions: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setCategory: (category: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setRating: (rating: number | null) => void;
  setSort: (sort: string) => void;
  setPage: (page: number) => void;
  setLocation: (location: { city: string; pincode: string }) => void;
  
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSuggestions: (query: string) => Promise<void>;
  clearFilters: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  // Initial State
  searchQuery: "",
  category: "All",
  priceRange: [0, 5000],
  rating: null,
  sort: "featured",
  location: { city: "", pincode: "" },
  
  products: [],
  categories: [],
  suggestions: [],
  totalProducts: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  // Actions
  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setCategory: (category) => set({ category, currentPage: 1 }),
  setPriceRange: (priceRange) => set({ priceRange, currentPage: 1 }),
  setRating: (rating) => set({ rating, currentPage: 1 }),
  setSort: (sort) => set({ sort, currentPage: 1 }),
  setPage: (currentPage) => set({ currentPage }),
  setLocation: (location) => set({ location }),

  fetchProducts: async () => {
    const { searchQuery, category, priceRange, rating, sort, currentPage } = get();
    
    set({ isLoading: true, error: null });
    try {
      const response = await productService.getAllProducts({
        search: searchQuery,
        category: category === "All" ? undefined : category,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        rating: rating || undefined,
        sort,
        page: currentPage,
        limit: 12,
      });

      set({
        products: response.products,
        totalProducts: response.total,
        totalPages: response.pages,
        isLoading: false,
      });
    } catch (err: any) {
      set({ 
        error: err.message || "Failed to load products", 
        isLoading: false,
        products: [] 
      });
    }
  },

  fetchSuggestions: async (query: string) => {
    if (!query.trim()) {
      set({ suggestions: [] });
      return;
    }
    try {
      const response = await productService.getAllProducts({
        search: query,
        limit: 8
      });
      set({ suggestions: response.products });
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  },

  fetchCategories: async () => {
    try {
      const { categoryService } = await import("@/services/categoryService");
      const response = await categoryService.getAllCategories();
      set({ categories: response.categories || [] });
    } catch (error) {
      console.error("Failed to fetch categories in store:", error);
    }
  },

  clearFilters: () => set({
    searchQuery: "",
    category: "All",
    priceRange: [0, 5000],
    rating: null,
    sort: "featured",
    currentPage: 1
  }),
}));
