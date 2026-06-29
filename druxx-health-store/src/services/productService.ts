import api from "@/lib/api";
import { Product } from "@/types";
import { getDeliveryPerformance } from "@/lib/utils";

export const mapBackendProduct = (p: any): Product => {
  if (!p) return {} as Product;

  const comparePrice = p.comparePrice ? Number(p.comparePrice) : Number(p.price);
  const price = Number(p.price) || 0;
  const discount = comparePrice > price 
    ? Math.round(((comparePrice - price) / comparePrice) * 100) 
    : 0;

  return {
    id: p.id,
    name: p.title,
    slug: p.slug,
    description: p.description || "",
    shortDescription: p.shortDesc || p.description?.substring(0, 160) || "",
    price,
    originalPrice: comparePrice,
    discount,
    rating: Number(p.averageRating) || 0,
    images: p.images && p.images.length > 0 ? p.images.map((img: any) => img.url) : ["/placeholder.png"],
    category: p.category?.name || "Uncategorized",
    categorySlug: p.category?.slug || "uncategorized",
    categoryId: p.categoryId,
    vendor: {
      id: p.vendor?.id || "",
      name: p.vendor?.storeName || "Druxx Seller",
      slug: p.vendor?.storeSlug || "",
      logo: p.vendor?.storeLogo || "/vendor-placeholder.png",
      description: p.vendor?.storeDescription || "",
      rating: Number(p.vendor?.rating) || 0,
      reviewCount: 0,
      productCount: 0,
      location: "India",
      isVerified: true,
      isTopSeller: false,
      deliveryPerformance: getDeliveryPerformance(Number(p.vendor?.rating) || 0, p.vendor?.id || ""),
      joinedDate: p.vendor?.createdAt || "",
      specialties: [],
    },
    stock: p.stockQty || 0,
    tags: p.tags || [],
    isFeatured: !!p.isFeatured,
    isBestSeller: false,
    isNew: false,
    brand: "Druxx",
    sku: p.sku || "",
    weight: "500g",
    shippingInfo: "Standard: 2-5 Days",
    metadata: p.metadata || {},
    reviews: p.reviews?.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user?.name || "Customer",
      userAvatar: r.user?.avatarUrl,
      rating: r.rating,
      title: r.title || "",
      comment: r.comment || "",
      date: r.createdAt,
      verified: !!r.isVerified
    })) || [],
    reviewCount: p.reviewCount || 0,
  };
};

const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 60 * 1000; // 60 seconds

export const productService = {
  async getAllProducts(params: any = {}) {
    const cacheKey = JSON.stringify(params);
    const now = Date.now();
    
    if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_TTL)) {
      return cache[cacheKey].data;
    }

    try {
      const response = await api.get('/products', { params });
      const products = response.data.products || [];
      const result = {
        products: products.map(mapBackendProduct),
        total: response.data.total || products.length,
        pages: response.data.pages || 1,
      };
      
      cache[cacheKey] = { data: result, timestamp: now };
      return result;
    } catch (err: any) {
      console.error("Product Fetch Error:", err);
      return { products: [], total: 0, pages: 1 };
    }
  },

  async getProductBySlug(slug: string) {
    const response = await api.get(`/products/slug/${slug}`);
    // Backend returns { status: 'success', data: { product: { ... } } }
    const productData = response.data.data?.product || response.data;
    return mapBackendProduct(productData);
  },

  async getFeatured() {
    return this.getAllProducts({ sort: 'featured', limit: 100 });
  },

  async getBestSellers() {
    try {
      const response = await api.get('/products/best-sellers', { params: { limit: 20 } });
      const products = response.data.products || [];
      return {
        products: products.map(mapBackendProduct),
        total: response.data.total || products.length,
        pages: response.data.pages || 1,
      };
    } catch {
      // Fallback to regular sort if endpoint fails
      return this.getAllProducts({ sort: 'best-seller', limit: 20 });
    }
  },

  async getNewArrivals() {
    return this.getAllProducts({ sort: 'newest', limit: 100 });
  },

  async getReviews(productId: string) {
    // Currently, reviews are included in the product fetch
    // But we can implement a separate fetch if we want to load more
    try {
      const response = await api.get(`/products/${productId}`);
      const product = mapBackendProduct(response.data.data?.product || response.data);
      return product.reviews || [];
    } catch {
      return [];
    }
  },

  async getCategories() {
    const response = await api.get('/categories');
    return response.data.data?.categories || [];
  },

  /**
   * Submit a review for a product.
   * Requires the user to be authenticated (JWT auto-attached by api interceptor).
   * Backend enforces one review per user per product (409 on duplicate).
   */
  async submitReview(productId: string, data: {
    rating: number;
    title?: string;
    comment?: string;
  }) {
    const response = await api.post(`/products/${productId}/reviews`, data);
    return response.data.data.review;
  },

  /**
   * Fetch fresh reviews for a product by productId (client-side refresh).
   */
  async getProductReviews(productId: string, page = 1, limit = 20) {
    try {
      const response = await api.get(`/products/${productId}/reviews`, {
        params: { page, limit }
      });
      return response.data.reviews || [];
    } catch {
      return [];
    }
  },

  async getPersonalizedProducts(guestCategories?: string[]) {
    try {
      const params: any = {};
      if (guestCategories && guestCategories.length > 0) {
        params.categories = guestCategories.join(",");
      }
      const response = await api.get('/products/personalized', { params });
      const products = response.data.products || [];
      return {
        products: products.map(mapBackendProduct),
        total: response.data.total || products.length,
        pages: response.data.pages || 1,
      };
    } catch (err: any) {
      console.error("Personalized Products Fetch Error:", err);
      return { products: [], total: 0, pages: 1 };
    }
  },
};
