import api from "@/lib/api";
import { CartItem, Product } from "@/types";

interface CartResponse {
  status: string;
  data: {
    id: string;
    items: any[];
  } | null;
}

const mapBackendCartItem = (item: any): CartItem => {
  const p = item.product;
  
  const product: Product = {
    id: p.id,
    name: p.title,
    slug: p.slug,
    description: p.description || "",
    shortDescription: p.shortDesc || "",
    price: Number(p.price),
    originalPrice: Number(p.comparePrice) || Number(p.price),
    discount: p.comparePrice > 0 ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0,
    rating: Number(p.averageRating) || 0,
    reviewCount: p.reviewCount || 0,
    images: p.images?.length > 0 ? p.images.map((img: any) => img.url) : ["/placeholder.png"],
    category: "Uncategorized",
    categorySlug: "uncategorized",
    vendor: {
      id: p.vendor?.id || "",
      name: p.vendor?.storeName || "Druxx Seller",
      slug: "",
      logo: "",
      description: "",
      rating: 0,
      reviewCount: 0,
      productCount: 0,
      location: "",
      isVerified: true,
      isTopSeller: false,
      deliveryPerformance: 100,
      joinedDate: "",
      specialties: [],
    },
    stock: p.stockQty || 0,
    tags: [],
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    brand: "Druxx",
    sku: p.sku || "",
    weight: "500g",
    shippingInfo: "",
  };

  return {
    id: item.id,
    product,
    quantity: item.quantity,
  };
};

export const cartService = {
  async getCart() {
    const response = await api.get("/cart");
    if (response.data.status === "success" && response.data.data) {
      return response.data.data.items.map(mapBackendCartItem);
    }
    return [];
  },

  async addItem(productId: string, quantity: number) {
    const response = await api.post("/cart/items", { productId, quantity });
    if (response.data.status === "success" && response.data.data) {
      return response.data.data.items.map(mapBackendCartItem);
    }
    return [];
  },

  async syncCart(items: { productId: string; quantity: number }[]) {
    const response = await api.post("/cart/sync", { items });
    if (response.data.status === "success" && response.data.data) {
      return response.data.data.items.map(mapBackendCartItem);
    }
    return [];
  },

  async updateItem(cartItemId: string, quantity: number) {
    const response = await api.put(`/cart/items/${cartItemId}`, { quantity });
    if (response.data.status === "success" && response.data.data) {
      return response.data.data.items.map(mapBackendCartItem);
    }
    return [];
  },

  async removeItem(cartItemId: string) {
    const response = await api.delete(`/cart/items/${cartItemId}`);
    if (response.data.status === "success" && response.data.data) {
      return response.data.data.items.map(mapBackendCartItem);
    }
    return [];
  },

  async clearCart() {
    await api.delete("/cart");
    return true;
  },
};
