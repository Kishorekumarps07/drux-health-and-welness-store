import api from "@/lib/api";

export const userService = {
  async getProfile() {
    const response = await api.get("/users/profile");
    return response.data.data;
  },

  async updateProfile(data: any) {
    const response = await api.patch("/users/profile", data);
    return response.data.data;
  },

  // ── Addresses ─────────────────────────────────────────────────────────────

  async getAddresses() {
    const response = await api.get("/users/addresses");
    if (response.data.status === "success") {
      // Backend returns { data: { addresses: [] } }
      return response.data.data.addresses || [];
    }
    return [];
  },

  async createAddress(data: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    label?: string;
    isDefault?: boolean;
  }) {
    const response = await api.post("/users/addresses", data);
    if (response.data.status === "success") {
      // Backend returns { data: { address: {} } }
      return response.data.data.address;
    }
    throw new Error(response.data.message || "Failed to save address");
  },

  async updateAddress(id: string, data: any) {
    const response = await api.patch(`/users/addresses/${id}`, data);
    if (response.data.status === "success") {
       return response.data.data.address;
    }
    return null;
  },

  async deleteAddress(id: string) {
    await api.delete(`/users/addresses/${id}`);
  },
};
