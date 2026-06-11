import api from "@/lib/api";

export const adminService = {
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/analytics/overview');
      return response.data.data?.stats || { revenue: 0, growth: 0, vendors: 0, users: 0, orders: 0 };
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      return { revenue: 0, growth: 0, vendors: 0, users: 0, orders: 0 };
    }
  },

  async listVendors(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    try {
      const response = await api.get('/admin/vendors', { params });
      return {
        status: "success",
        vendors: response.data.vendors || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1
      };
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
      return { status: "error", vendors: [], total: 0, page: 1, pages: 1 };
    }
  },

  async updateVendorStatus(id: string, status: string, reason?: string) {
    const response = await api.put(`/admin/vendors/${id}/status`, { status, reason });
    return response.data;
  },

  async listAllOrders(params?: any) {
    try {
      const response = await api.get('/orders/all', { params });
      return {
        status: "success",
        orders: response.data.orders || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1
      };
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      return { status: "error", orders: [], total: 0, page: 1, pages: 1 };
    }
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  async getRevenueAnalytics(range = '7d') {
    try {
      const response = await api.get('/admin/analytics/revenue', { params: { range } });
      return response.data.data || [];
    } catch (err) {
      console.error("Failed to fetch revenue analytics:", err);
      return [];
    }
  },

  async getPerformanceStats() {
    try {
      const response = await api.get('/admin/analytics/performance');
      return response.data.data || { topVendors: [], topProducts: [] };
    } catch (err) {
      console.error("Failed to fetch performance stats:", err);
      return { topVendors: [], topProducts: [] };
    }
  },

  async getActivityFeed() {
    try {
      const response = await api.get('/admin/analytics/activity');
      return response.data.data || [];
    } catch (err) {
      console.error("Failed to fetch activity feed:", err);
      return [];
    }
  },

  async listUsers(params?: any) {
    try {
      const response = await api.get('/admin/users', { params });
      return {
        status: "success",
        users: response.data.users || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1
      };
    } catch (err) {
      console.error("Failed to fetch users:", err);
      return { status: "error", users: [], total: 0, page: 1, pages: 1 };
    }
  },

  async listInventory(params?: { search?: string }) {
    try {
      const response = await api.get('/admin/inventory', { params });
      return {
        status: "success",
        products: response.data.products || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1
      };
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      return { status: "error", products: [], total: 0, page: 1, pages: 1 };
    }
  },

  async listNewsletterSubscribers(params?: { page?: number; limit?: number; search?: string }) {
    try {
      const response = await api.get('/admin/newsletter/subscribers', { params });
      return {
        status: "success",
        subscribers: response.data.subscribers || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.pages || 1,
      };
    } catch (err) {
      console.error("Failed to fetch newsletter subscribers:", err);
      return { status: "error", subscribers: [], total: 0, page: 1, pages: 1 };
    }
  },

  async deleteNewsletterSubscriber(email: string) {
    const response = await api.delete(`/admin/newsletter/subscribers/${encodeURIComponent(email)}`);
    return response.data;
  },

  getNewsletterExportUrl(): string {
    return `${api.defaults.baseURL}/admin/newsletter/subscribers/export`;
  },

  async sendNewsletterBlast(subject: string, body: string) {
    const response = await api.post('/admin/newsletter/send', { subject, body });
    return response.data.data as { sent: number; failed: number; total: number };
  },
};
