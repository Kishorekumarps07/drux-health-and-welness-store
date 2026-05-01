import api from "@/lib/api";
import { Address } from "@/types";

interface AddressResponse {
  status: string;
  data: {
    addresses?: any[];
    address?: any;
  };
}

export const userService = {
  async getAddresses() {
    const response = await api.get<any>("/users/addresses");
    if (response.data.status === "success") {
      return response.data.addresses || [];
    }
    return [];
  },

  async addAddress(address: Omit<Address, "id" | "isDefault">) {
    const response = await api.post<any>("/users/addresses", address);
    if (response.data.status === "success") {
      return response.data.address;
    }
    throw new Error("Failed to add address");
  },

  async deleteAddress(id: string) {
    await api.delete(`/users/addresses/${id}`);
  },

  async updateAddress(id: string, address: Partial<Address>) {
    await api.put(`/users/addresses/${id}`, address);
  },
};
