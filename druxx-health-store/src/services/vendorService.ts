import api from "@/lib/api";
import { Vendor } from "@/types";

export interface VendorStats {
  totalSales: string;
  orderItemCount: number;
  orderCount: number;
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
  deliveryPerformance: 99,
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
          deliveryPerformance: 99,
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Unauthorized");

    // 1. Get Vendor ID for this user
    const { data: vendor, error: vErr } = await supabase
      .from('vendors')
      .select('id')
      .eq('owner_id', session.user.id)
      .maybeSingle();

    if (vErr || !vendor) {
      console.warn("User is not linked to a vendor account.");
      return { status: "success", items: [], total: 0, pages: 1, page: 1 };
    }

    // 2. Fetch order items for this vendor
    let query = supabase
      .from('order_items')
      .select('*, order:orders(*)', { count: 'exact' })
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false });

    if (params.status && params.status !== 'ALL') {
      query = query.eq('status', params.status);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    // 3. Format to VendorOrderItem interface
    const items = (data || []).map((item: any) => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      vendorId: item.vendor_id,
      title: item.title,
      price: Number(item.price),
      quantity: Number(item.quantity),
      total: Number(item.total),
      status: item.status || 'PENDING',
      createdAt: item.created_at,
      updatedAt: item.created_at,
      order: {
        id: item.order?.id,
        status: item.order?.status,
        paymentStatus: item.order?.payment_status,
        paymentMethod: item.order?.payment_method,
        createdAt: item.order?.created_at,
        user: { name: item.order?.address?.fullName || "Customer", email: "", phone: item.order?.address?.phone || "" },
        address: item.order?.address || {},
      },
      product: {
        id: item.product_id,
        title: item.title,
        images: []
      }
    }));

    return {
      status: "success",
      items,
      total: count || 0,
      pages: 1,
      page: 1
    };
  },

  /**
   * Get specific order item detail
   */
  async getOrderItem(id: string) {
    const response = await api.get<{ status: string; data: { orderItem: VendorOrderItem } }>(`/vendor/orders/${id}`);
    return response.data.data.orderItem;
  },

  /**
   * Update item status (Triggers parent order sync on backend)
   */
  async updateItemStatus(id: string, status: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('order_items')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Submit a new vendor application
   */
  async applyVendor(data: { storeName: string; storeDescription: string; gstNumber?: string; category: string }) {
    const response = await api.post('/vendors/apply', {
      storeName: data.storeName,
      storeDescription: data.storeDescription,
      gstNumber: data.gstNumber
    });
    return response.data;
  },

  /**
   * Check current user's vendor application status
   */
  async getMyApplication() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('owner_id', session.user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
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
        category: p.category?.name || "Uncategorized",
        categoryId: p.categoryId,
        sku: p.sku || `PRD-${p.id.substring(0, 5).toUpperCase()}`
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
  }
};
