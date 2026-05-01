import api from "@/lib/api";
import { User } from "@/types";

interface AuthResponse {
  status: string;
  data: {
    user: any;
    accessToken?: string;
    refreshToken?: string;
  };
}

const mapBackendUser = (backendUser: any): User => {
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    avatar: backendUser.avatarUrl || `https://api.dicebear.com/8.x/avataaars/svg?seed=${backendUser.name}`,
    phone: backendUser.phone || "",
    roles: backendUser.roles || ["CUSTOMER"],
    activeRole: backendUser.roles?.[0] || "CUSTOMER", // Basic default, will be refined in store
    addresses: backendUser.addresses || [],
    isVendor: backendUser.roles?.includes("VENDOR") || false,
    vendorId: backendUser.vendor?.id || undefined,
  };
};

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post<AuthResponse>("/auth/login", { email, password });
    if (response.data.status === "success") {
      const { user, accessToken } = response.data.data;
      return {
        user: mapBackendUser(user),
        token: accessToken || null,
      };
    }
    throw new Error("Login failed");
  },

  async register(name: string, email: string, password: string, role: string = "CUSTOMER") {
    const response = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
      role,
    });
    if (response.data.status === "success") {
      const { user, accessToken } = response.data.data;
      return {
        user: mapBackendUser(user),
        token: accessToken || null,
      };
    }
    throw new Error("Registration failed");
  },

  async getMe() {
    const response = await api.get<AuthResponse>("/auth/me");
    if (response.data.status === "success") {
      return mapBackendUser(response.data.data.user);
    }
    throw new Error("Failed to fetch profile");
  },

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
  },
};
