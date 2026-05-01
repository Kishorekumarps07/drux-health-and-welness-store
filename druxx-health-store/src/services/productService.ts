import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

const mapSupabaseProduct = (p: any): Product => {
  if (!p) return {} as Product;

  const discount = p.original_price > 0 
    ? Math.round(((p.original_price - p.price) / p.original_price) * 100) 
    : 0;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || "",
    shortDescription: p.description?.substring(0, 160) || "",
    price: Number(p.price) || 0,
    originalPrice: Number(p.original_price) || Number(p.price) || 0,
    discount,
    rating: Number(p.rating) || 0,
    reviewCount: 0,
    images: p.image ? [p.image] : ["/placeholder.png"],
    category: p.categories?.name || "Uncategorized",
    categorySlug: p.categories?.slug || "uncategorized",
    vendor: {
      id: p.vendors?.id || "",
      name: p.vendors?.name || "Druxx Seller",
      slug: p.vendors?.slug || "",
      logo: p.vendors?.logo || "/vendor-placeholder.png",
      description: p.vendors?.description || "",
      rating: Number(p.vendors?.rating) || 0,
      reviewCount: 0,
      productCount: 0,
      location: "India",
      isVerified: !!p.vendors?.is_verified,
      isTopSeller: false,
      deliveryPerformance: 98,
      joinedDate: p.vendors?.created_at || "",
      specialties: [],
    },
    stock: p.stock || 0,
    tags: [],
    isFeatured: !!p.is_featured,
    isBestSeller: !!p.is_best_seller,
    isNew: !!p.is_new,
    brand: "Druxx",
    sku: "",
    weight: "500g",
    shippingInfo: "Standard: 2-5 Days",
  };
};

export const productService = {
  async getAllProducts(params: any = {}) {
    try {
      let query = supabase.from('products').select(`
        *,
        categories!inner (name, slug),
        vendors!inner (*)
      `, { count: 'exact' });

      if (params.search) {
        query = query.ilike('name', `%${params.search}%`);
      }
      if (params.category && params.category !== "All") {
        query = query.eq('categories.name', params.category);
      }
      if (params.minPrice !== undefined && params.minPrice !== null) {
        query = query.gte('price', params.minPrice);
      }
      if (params.maxPrice !== undefined && params.maxPrice !== null) {
        query = query.lte('price', params.maxPrice);
      }
      if (params.rating) {
        query = query.gte('rating', params.rating);
      }

      if (params.isFeatured) query = query.eq('is_featured', true);
      if (params.isBestSeller) query = query.eq('is_best_seller', true);
      if (params.isNew) query = query.eq('is_new', true);

      if (params.sort === 'price-low') {
        query = query.order('price', { ascending: true });
      } else if (params.sort === 'price-high') {
        query = query.order('price', { ascending: false });
      } else if (params.sort === 'rating') {
        query = query.order('rating', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      return {
        products: (data || []).map(mapSupabaseProduct),
        total: count || data?.length || 0,
        pages: Math.ceil((count || data?.length || 0) / (params.limit || 12)),
      };
    } catch (err: any) {
      console.error("Product Fetch Error Details:", {
        message: err.message,
        details: err.details,
        hint: err.hint
      });
      throw err;
    }
  },

  async getProductBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug),
        vendors (*)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return mapSupabaseProduct(data);
  },

  async getFeatured() {
    return this.getAllProducts({ isFeatured: true, limit: 10 });
  },

  async getBestSellers() {
    return this.getAllProducts({ isBestSeller: true, limit: 10 });
  },

  async getNewArrivals() {
    return this.getAllProducts({ isNew: true, limit: 10 });
  },

  async getReviews(productId: string) {
    // Currently no reviews table, return empty
    return [];
  },
};
