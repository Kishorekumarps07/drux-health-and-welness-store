import api from "@/lib/api";
import { Product } from "@/types";
import { mapBackendProduct } from "./productService";

interface WishlistResponse {
  status: string;
  data: {
    items: any[];
  };
}

export const wishlistService = {
  async getWishlist(): Promise<Product[]> {
    const response = await api.get<WishlistResponse>("/wishlist");
    if (response.data.status === "success" && response.data.data) {
      return response.data.data.items.map(mapBackendProduct);
    }
    return [];
  },

  async addToWishlist(productId: string): Promise<Product[]> {
    const response = await api.post<WishlistResponse>("/wishlist/items", { productId });
    if (response.data.status === "success" && response.data.data) {
      return response.data.data.items.map(mapBackendProduct);
    }
    return [];
  },

  async removeFromWishlist(productId: string): Promise<Product[]> {
    const response = await api.delete<WishlistResponse>(`/wishlist/items/${productId}`);
    if (response.data.status === "success" && response.data.data) {
      return response.data.data.items.map(mapBackendProduct);
    }
    return [];
  },

  async syncWishlist(productIds: string[]): Promise<Product[]> {
    const response = await api.post<WishlistResponse>("/wishlist/sync", { productIds });
    if (response.data.status === "success" && response.data.data) {
      return response.data.data.items.map(mapBackendProduct);
    }
    return [];
  }
};
