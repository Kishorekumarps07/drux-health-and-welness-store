import api from "@/lib/api";
import { Product } from "@/types";

const mapBackendProduct = (p: any): Product => {
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
    reviewCount: 0,
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
      deliveryPerformance: 98,
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
  };
};

export const productService = {
  async getAllProducts(params: any = {}) {
    try {
      const response = await api.get('/products', { params });
      const products = response.data.products || [];
      return {
        products: products.map(mapBackendProduct),
        total: response.data.total || products.length,
        pages: response.data.pages || 1,
      };
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
    return this.getAllProducts({ sort: 'featured', limit: 10 });
  },

  async getBestSellers() {
    return this.getAllProducts({ sort: 'best-seller', limit: 10 });
  },

  async getNewArrivals() {
    return this.getAllProducts({ sort: 'newest', limit: 10 });
  },

  async getReviews(productId: string) {
    return [];
  },

  async getCategories() {
    const response = await api.get('/categories');
    return response.data.data?.categories || [];
  },
};
