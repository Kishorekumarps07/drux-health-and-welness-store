import { supabase } from "@/lib/supabase";

export const adminService = {
  async getDashboardStats() {
    return { revenue: 0, growth: 0, vendors: 0, users: 0, orders: 0 };
  },

  async listVendors(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    let query = supabase.from('vendors').select('*', { count: 'exact' });
    if (params?.search) query = query.ilike('name', `%${params.search}%`);
    const { data, count } = await query;
    return { status: "success", vendors: data || [], total: count || 0, page: 1, pages: 1 };
  },

  async updateVendorStatus(id: string, status: string, reason?: string) {
    const { data } = await supabase.from('vendors').update({ status }).eq('id', id).select().single();
    return { status: "success", data };
  },

  async listAllOrders(params?: any) {
    const { data, count } = await supabase.from('orders').select('*, items:order_items(*)', { count: 'exact' });
    return { status: "success", orders: data || [], total: count || 0, page: 1, pages: 1 };
  },

  async updateOrderStatus(id: string, status: string) {
    const { data } = await supabase.from('orders').update({ status }).eq('id', id).select().single();
    return { status: "success", data };
  },

  async getRevenueAnalytics(range = '7d') {
    return [];
  },

  async getPerformanceStats() {
    return { topVendors: [], topProducts: [] };
  },

  async getActivityFeed() {
    return [];
  },

  async listUsers(params?: any) {
    // Return empty array for now since auth.users cannot be easily queried from client side without service role
    return { status: "success", users: [], total: 0, page: 1, pages: 1 };
  },

  async listInventory(params?: { search?: string }) {
    const { data, count } = await supabase.from('products').select('*', { count: 'exact' });
    return { status: "success", products: data || [], total: count || 0, page: 1, pages: 1 };
  }
};
