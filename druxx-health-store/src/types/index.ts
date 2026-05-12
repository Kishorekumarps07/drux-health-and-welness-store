// ─────────────────────────────────────────
// Druxx Health Store — TypeScript Types
// ─────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  discount: number; // percentage
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  categorySlug: string;
  categoryId?: string;
  vendor: Vendor;
  stock: number;
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  brand: string;
  sku: string;
  weight: string;
  dimensions?: string;
  shippingInfo: string;
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner?: string;
  description: string;
  rating: number;
  reviewCount: number;
  productCount: number;
  location: string;
  isVerified: boolean;
  isTopSeller: boolean;
  deliveryPerformance: number; // e.g., 99 for 99% on-time delivery
  joinedDate: string;
  specialties: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  productCount: number;
  color: string;
  gradient: string;
  subcategories: string[];
}

export interface CartItem {
  id?: string; // Database ID (e.g., cartItem.id)
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  couponCode?: string;
  discount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  vendorId: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  date: string;
}

export type UserRole = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  roles: UserRole[];
  activeRole: UserRole;
  addresses: Address[];
  isVendor: boolean;
  vendorId?: string; // Linked vendor profile if isVendor is true
}

export interface Address {
  id: string;
  label: string; // Home, Work, etc.
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId?: string;
  vendorId?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface VendorAnalytics {
  totalSales: number;
  totalOrders: number;
  totalViews: number;
  recentOrders: Order[];
  salesByDay: { date: string; amount: number }[];
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
  bgColor: string;
  badge?: string;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export type VendorStatus = 'pending' | 'approved' | 'active' | 'suspended';
export type PaymentMethod = 'card' | 'upi' | 'cod';
export type CheckoutStep = 'address' | 'payment' | 'review';
export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
