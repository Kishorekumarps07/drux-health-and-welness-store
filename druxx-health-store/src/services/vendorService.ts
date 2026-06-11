import api from "@/lib/api";
import { Vendor } from "@/types";
import { getDeliveryPerformance } from "@/lib/utils";

export interface VendorStats {
  totalSales: string;
  orderItemCount: number;
  orderCount: number;
  pendingOrderCount: number;
  productCount: number;
}

export interface VendorOrderItem {
  id: string;
  orderId: string;
  productId: string;
  vendorId: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
    user: { name: string; email: string; phone: string; };
    address: { 
      fullName: string;
      phone: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  product: {
    id: string;
    title: string;
    images?: { url: string }[];
  };
}

/**
 * Helper to map backend vendor data to frontend Vendor type
 */
const mapVendor = (bv: any): Vendor => ({
  id: bv.id,
  name: bv.storeName,
  slug: bv.storeSlug,
  logo: bv.storeLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${bv.storeName}`,
  banner: bv.storeBanner || "https://images.unsplash.com/photo-1506784919140-50cf144ad310?q=80&w=2000",
  description: bv.storeDescription || "A trusted wellness brand on Druxx Health Store.",
  rating: parseFloat(bv.rating) || 0,
  reviewCount: 0, // Not currently returned by backend list
  productCount: 0, // Not currently returned by backend list
  location: "India",
  isVerified: bv.approvalStatus === 'APPROVED' || bv.approvalStatus === 'ACTIVE',
  isTopSeller: parseFloat(bv.rating) >= 4.5,
  deliveryPerformance: getDeliveryPerformance(parseFloat(bv.rating) || 0, bv.id),
  joinedDate: bv.createdAt,
  specialties: ["Health", "Wellness"]
});

import { supabase } from "@/lib/supabase";

export const vendorService = {
  /**
   * Public: List all verified vendors
   */
  async getAllVendors(params: { page?: number; limit?: number; search?: string } = {}) {
    try {
      const response = await api.get('/vendors', { params });
      const data = response.data.vendors || [];
      return {
        status: "success",
        vendors: data.map((bv: any) => ({
          id: bv.id,
          name: bv.storeName,
          slug: bv.storeSlug,
          logo: bv.storeLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${bv.storeName}`,
          banner: bv.storeBanner || "https://images.unsplash.com/photo-1506784919140-50cf144ad310?q=80&w=2000",
          description: bv.storeDescription || "A trusted wellness brand on Druxx Health Store.",
          rating: parseFloat(bv.rating) || 0,
          reviewCount: 0,
          productCount: bv._count?.products || 0,
          location: "India",
          isVerified: bv.approvalStatus === "ACTIVE",
          isTopSeller: parseFloat(bv.rating) >= 4.5,
          deliveryPerformance: getDeliveryPerformance(parseFloat(bv.rating) || 0, bv.id),
          joinedDate: bv.createdAt,
          specialties: ["Health", "Wellness"]
        })),
        total: response.data.total || data.length,
        pages: response.data.pages || 1,
        page: response.data.page || 1
      };
    } catch (err) {
      console.error("Vendor fetch error:", err);
      return { status: "error", vendors: [], total: 0, pages: 1, page: 1 };
    }
  },

  /**
   * Public: Get public store details by slug
   */
  async getStoreBySlug(slug: string) {
    const response = await api.get<{ status: string; data: { vendor: any } }>(`/vendors/${slug}`);
    return {
      vendor: mapVendor(response.data.data.vendor),
      products: response.data.data.vendor.products || [],
    };
  },

  /**
   * Fetch Dashboard Stats
   */
  async getDashboardStats() {
    const response = await api.get<{ status: string; data: { stats: VendorStats } }>("/vendor/stats");
    return response.data.data.stats;
  },

  /**
   * Fetch Paginated Order Items
   */
  async getMyOrders(params: { page?: number; limit?: number; status?: string } = {}) {
    try {
      const response = await api.get('/vendor/orders', { params });
      
      const responseItems = response.data.items || [];
      const items: VendorOrderItem[] = responseItems.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        vendorId: item.vendorId,
        title: item.title,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total: Number(item.total),
        status: item.status || 'PENDING',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        order: {
          id: item.order?.id || item.orderId,
          status: item.order?.status || 'PENDING',
          paymentStatus: item.order?.paymentStatus || 'PAID',
          paymentMethod: item.order?.paymentMethod || 'Razorpay',
          createdAt: item.order?.createdAt || item.createdAt,
          user: { 
            name: item.order?.address?.fullName || item.order?.user?.name || "Customer", 
            email: item.order?.user?.email || "", 
            phone: item.order?.address?.phone || item.order?.user?.phone || "" 
          },
          address: item.order?.address || {},
        },
        product: {
          id: item.productId,
          title: item.title,
          images: item.product?.images?.map((img: any) => ({ url: img.url })) || []
        }
      }));

      return {
        status: "success",
        items,
        total: response.data.total || items.length,
        pages: response.data.pages || 1,
        page: response.data.page || 1
      };
    } catch (err) {
      console.error("Vendor orders fetch error:", err);
      return { status: "success", items: [], total: 0, pages: 1, page: 1 };
    }
  },

  /**
   * Get specific order item detail
   */
  async getOrderItem(id: string) {
    const response = await api.get<{ status: string; data: { orderItem: VendorOrderItem } }>(`/vendor/orders/${id}`);
    return response.data.data.orderItem;
  },

  /**
   * Update item status via Backend API
   */
  async updateItemStatus(id: string, status: string) {
    const response = await api.patch(`/vendor/orders/${id}/status`, { status });
    return response.data.data.orderItem;
  },

  /**
   * Submit a new vendor application
   */
  async applyVendor(data: { storeName: string; storeDescription: string; gstNumber?: string; category: string }) {
    // We use our new onboard endpoint which handles both creation and promotion
    const response = await api.post('/vendor/onboard', {
      storeName: data.storeName,
      storeDescription: data.storeDescription,
      gstNumber: data.gstNumber,
      category: data.category
    });
    return response.data;
  },

  /**
   * Check current user's vendor application status
   */
  async getMyApplication() {
    try {
      const response = await api.get('/vendor/me');
      return response.data.data.vendor;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null; // No profile found, which is a valid state for new applicants
      }
      throw err;
    }
  },
  
  /**
   * Fetch detailed analytics for vendor
   */
  async getAnalytics(params: { range?: string } = {}) {
    const response = await api.get<{ status: string; data: { analytics: any } }>("/vendor/analytics", { params });
    return response.data.data.analytics;
  },

  /**
   * Fetch payouts and financial info
   */
  async getPayments() {
    const response = await api.get<{ status: string; data: { payments: any } }>("/vendor/payments");
    return response.data.data.payments;
  },

  /**
   * Update vendor settings/profile
   */
  async updateProfile(data: any) {
    const response = await api.patch<{ status: string; data: { vendor: any } }>("/vendor/profile", data);
    return response.data.data.vendor;
  },

  /**
   * Fetch vendor's own products via Backend API
   */
  async getMyProducts(params: { page?: number; limit?: number; search?: string } = {}) {
    const response = await api.get('/products/vendor/my', { params });
    const { products, total, pages, page } = response.data;

    return { 
      status: "success", 
      products: products.map((p: any) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        originalPrice: p.comparePrice || p.price,
        stock: p.stockQty,
        description: p.description,
        images: p.images && p.images.length > 0 ? p.images.map((img: any) => img.url) : ["/placeholder.png"],
        category: {
          name: p.category?.name || "Uncategorized",
          id: p.category?.id || p.categoryId
        },
        categoryId: p.categoryId,
        sku: p.sku || `PRD-${p.id.substring(0, 5).toUpperCase()}`,
        metadata: p.metadata || {}
      })), 
      total, 
      pages, 
      page 
    };
  },

  async deleteProduct(id: string) {
    await api.delete(`/products/${id}`);
    return { status: "success" };
  },

  async createProduct(data: any) {
    const response = await api.post('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: any) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Get paginated shipments for the current vendor
   */
  async getMyShipments(params: { page?: number; limit?: number; status?: string } = {}) {
    try {
      const response = await api.get('/vendor/shipments', { params });
      return response.data.data;
    } catch (err) {
      console.error("Vendor shipments fetch error:", err);
      return { shipments: [], total: 0, pages: 1, page: 1 };
    }
  },

  /**
   * Book a shipment on Shiprocket
   */
  async bookShipment(id: string, data: { length?: number; width?: number; height?: number; weight?: number; pickupLocation?: string } = {}) {
    const response = await api.post(`/vendor/shipments/${id}/book`, data);
    return response.data;
  },

  /**
   * Retrieve the shipping label URL (PDF)
   */
  async getShipmentLabel(id: string) {
    const response = await api.get<{ status: string; data: { labelUrl: string } }>(`/vendor/shipments/${id}/label`);
    return response.data.data;
  },

  /**
   * Track shipment events by ID
   */
  async getShipmentTracking(id: string) {
    const response = await api.get<{ status: string; data: { tracking: any } }>(`/vendor/shipments/${id}/track`);
    return response.data.data.tracking;
  },

  /**
   * Mark shipment as handed over to courier
   */
  async handoverShipment(id: string) {
    const response = await api.post(`/vendor/shipments/${id}/handover`);
    return response.data;
  },

  /**
   * Cancel shipment on Shiprocket and local database
   */
  async cancelShipment(id: string) {
    const response = await api.post(`/vendor/shipments/${id}/cancel`);
    return response.data;
  },

  /**
   * Generate/Assign AWB for a booked shipment
   */
  async generateAwb(id: string) {
    const response = await api.post(`/vendor/shipments/${id}/awb`);
    return response.data;
  },

  /**
   * Manually mark a shipment as shipped (non-Shiprocket)
   */
  async manualShipment(id: string, data: { awbCode: string; courierName: string; trackingUrl?: string }) {
    const response = await api.post(`/vendor/shipments/${id}/manual-ship`, data);
    return response.data;
  }
};
