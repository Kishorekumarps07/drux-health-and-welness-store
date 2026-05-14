import api from "@/lib/api";
import { Order } from "@/types";

export const orderService = {
  /**
   * Place a COD order via the backend API.
   * This ensures stock management and vendor logic are processed.
   */
  async placeOrder(data: {
    addressId: string;
    paymentMethod: string;
    notes?: string;
  }) {
    const response = await api.post("/orders", data);
    if (response.data.status === "success") {
      return response.data.data.order;
    }
    throw new Error(response.data.message || "Failed to place order");
  },

  /**
   * Create a Razorpay Order ID on the backend.
   */
  async createPaymentIntent() {
    const response = await api.post("/payments/create-intent");
    if (response.data.status === "success") {
      // The backend returns { data: { razorpayOrder: ... } }
      return { razorpayOrder: response.data.data.razorpayOrder };
    }
    throw new Error(response.data.message || "Failed to initialize payment");
  },

  /**
   * Verify signature and create order atomically on the backend.
   */
  async verifyAndCreateOrder(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    addressId: string;
    notes?: string;
  }) {
    const response = await api.post("/payments/verify-and-create", data);
    if (response.data.status === "success") {
      return response.data.data.order;
    }
    throw new Error(response.data.message || "Payment verification failed");
  },

  /**
   * Fetch my orders from the backend.
   */
  async getMyOrders(params = {}) {
    const response = await api.get("/orders", { params });
    if (response.data.status === "success") {
      return {
        status: "success",
        orders: response.data.orders,
        total: response.data.total,
        pages: response.data.pages,
      };
    }
    return { status: "error", orders: [], total: 0, pages: 1 };
  },

  /**
   * Fetch a single order.
   */
  async getOrder(id: string) {
    const response = await api.get(`/orders/${id}`);
    if (response.data.status === "success") {
      return response.data.data;
    }
    throw new Error("Failed to fetch order details");
  },

  async cancelOrder(id: string) {
    const response = await api.put(`/orders/${id}/cancel`);
    if (response.data.status === "success") {
      return response.data.data;
    }
    throw new Error("Failed to cancel order");
  },

  async getVendorOrders(params = {}) {
    const response = await api.get("/orders/vendor", { params });
    if (response.data.status === "success") {
      return {
        status: "success",
        orders: response.data.orders,
        total: response.data.total,
        pages: response.data.pages,
      };
    }
    return { status: "error", orders: [], total: 0, pages: 1 };
  },

  async getAllOrders(params = {}) {
    const response = await api.get("/orders/all", { params });
    if (response.data.status === "success") {
      return {
        status: "success",
        orders: response.data.orders,
        total: response.data.total,
        pages: response.data.pages,
      };
    }
    return { status: "error", orders: [], total: 0, pages: 1 };
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await api.put(`/orders/${id}/status`, { status });
    if (response.data.status === "success") {
      return response.data.data.order;
    }
    throw new Error("Failed to update order status");
  },
};
