export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface ActivityItem {
  type: 'ORDER' | 'USER' | 'VENDOR';
  title: string;
  user?: string;
  date: string;
  amount?: number;
  status?: string;
}

export interface VendorPerformance {
  storeName: string;
  totalSales: number;
  rating: number;
}

export interface ProductPerformance {
  title: string;
  averageRating: number;
  price: number;
  vendor: {
    storeName: string;
  };
}

export interface AnalyticsOverview {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  pendingVendors: number;
  totalRevenue: number;
  growth: {
    revenue: string;
    orders: string;
    users: string;
    vendors: string;
  };
}
