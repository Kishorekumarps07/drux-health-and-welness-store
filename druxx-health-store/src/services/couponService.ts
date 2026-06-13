import api from "@/lib/api";

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  isActive: boolean;
  productId?: string | null;
  vendorId?: string | null;
  product?: { id: string; title: string } | null;
  vendor?: { id: string; storeName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export const couponService = {
  /**
   * Fetch all coupons (Admin)
   */
  async getAllCoupons() {
    const response = await api.get('/coupons');
    return response.data.data?.coupons || [];
  },

  /**
   * Fetch active coupons (Public)
   */
  async getActiveCoupons(): Promise<Coupon[]> {
    const response = await api.get('/coupons/active');
    return response.data.data?.coupons || [];
  },

  /**
   * Create a coupon (Admin)
   */
  async createCoupon(data: { 
    code: string; 
    discountPercent: number; 
    discountType?: "PERCENTAGE" | "FIXED";
    discountValue?: number;
    isActive?: boolean;
    productId?: string | null;
    vendorId?: string | null;
  }) {
    const response = await api.post('/coupons', data);
    return response.data.data?.coupon;
  },

  /**
   * Update an existing coupon (Admin)
   */
  async updateCoupon(
    id: string, 
    updates: Partial<{ 
      code: string; 
      discountPercent: number; 
      discountType: "PERCENTAGE" | "FIXED";
      discountValue: number;
      isActive: boolean;
      productId: string | null;
      vendorId: string | null;
    }>
  ) {
    const response = await api.put(`/coupons/${id}`, updates);
    return response.data.data?.coupon;
  },

  /**
   * Delete a coupon (Admin)
   */
  async deleteCoupon(id: string) {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },

  /**
   * Validate a coupon code before applying it (Customer)
   */
  async validateCoupon(code: string) {
    const response = await api.get(`/coupons/validate/${code.toUpperCase()}`);
    return response.data.data?.coupon;
  },

  /**
   * Fetch all coupons belonging to the logged-in vendor
   */
  async getVendorCoupons(): Promise<Coupon[]> {
    const response = await api.get('/vendor/coupons');
    return response.data.data?.coupons || [];
  },

  /**
   * Create a new coupon scoped strictly to the logged-in vendor
   */
  async createVendorCoupon(data: {
    code: string;
    discountPercent: number;
    isActive?: boolean;
    productId?: string | null;
    expiresAt?: string | null;
    usageLimit?: number | null;
  }) {
    const response = await api.post('/vendor/coupons', data);
    return response.data.data?.coupon;
  },

  /**
   * Update a coupon belonging to the logged-in vendor
   */
  async updateVendorCoupon(
    id: string,
    updates: Partial<{
      code: string;
      discountPercent: number;
      isActive: boolean;
      productId: string | null;
      expiresAt: string | null;
      usageLimit: number | null;
    }>
  ) {
    const response = await api.put(`/vendor/coupons/${id}`, updates);
    return response.data.data?.coupon;
  },

  /**
   * Delete a coupon belonging to the logged-in vendor
   */
  async deleteVendorCoupon(id: string) {
    const response = await api.delete(`/vendor/coupons/${id}`);
    return response.data;
  },

  /**
   * Automatically generate a unique, store-prefixed coupon code for this vendor
   */
  async generateVendorCouponCode(discountPercent: number = 10): Promise<{ code: string }> {
    const response = await api.get(`/vendor/coupons/generate`, {
      params: { discountPercent }
    });
    return response.data.data;
  }
};
