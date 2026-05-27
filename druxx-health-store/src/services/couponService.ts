import api from "@/lib/api";

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
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
  }
};
